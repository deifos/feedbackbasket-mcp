import assert from 'node:assert/strict';
import test from 'node:test';
import { AGENT_SURFACE_VERSION, PRODUCT_OPERATIONS } from 'feedbackbasket-agent-contract';
import { MCP_TOOLS, dispatchTool, parseArgs } from '../src/index.js';
import { createOperationRequest, type FeedbackBasketClient } from '../src/client.js';
import { verifyMcpParity } from '../scripts/check-parity.js';

test('stdio MCP exposes the deterministic 3.0.0 contract', () => {
  assert.equal(AGENT_SURFACE_VERSION, '3.0.0');
  assert.equal(MCP_TOOLS.length, 31);
  assert.deepEqual(MCP_TOOLS.map(({ name }) => name), PRODUCT_OPERATIONS.map(({ mcp }) => mcp.name));
  assert.ok(MCP_TOOLS.every(({ inputSchema, outputSchema, annotations }) => inputSchema && outputSchema && annotations));
});

test('stdio MCP keeps command-line setup compatibility', () => {
  assert.deepEqual(parseArgs(['--api-key', 'value', '--base-url=http://localhost:3000']), {
    apiKey: 'value',
    baseUrl: 'http://localhost:3000',
  });
});

test('stdio MCP dispatches all 31 operation IDs', async () => {
  const calls: string[] = [];
  const client: Pick<FeedbackBasketClient, 'execute'> = {
    async execute(operationId) {
      calls.push(operationId);
      return { structuredContent: { operationId }, content: [{ type: 'text', text: JSON.stringify({ operationId }) }] };
    },
  };
  for (const operation of PRODUCT_OPERATIONS) {
    const properties = operation.mcp.inputSchema.properties as Record<string, { type?: unknown; const?: unknown; enum?: unknown[] }>;
    const args: Record<string, unknown> = {};
    for (const name of (operation.mcp.inputSchema.required ?? []) as string[]) {
      const schema = properties[name];
      args[name] = schema?.const ?? schema?.enum?.[0] ?? (
        schema?.type === 'boolean'
          ? true
          : schema?.type === 'array'
            ? ['item']
            : schema?.type === 'object'
              ? {}
              : 'value'
      );
    }
    const result = await dispatchTool(client, operation.mcp.name, args);
    assert.equal(result.isError, undefined, operation.id);
  }
  assert.deepEqual(calls, PRODUCT_OPERATIONS.map(({ id }) => id));
});

test('stdio MCP confirmation prevents all eight high-impact calls', async () => {
  let calls = 0;
  const client: Pick<FeedbackBasketClient, 'execute'> = {
    async execute() {
      calls += 1;
      return { structuredContent: {}, content: [{ type: 'text', text: '{}' }] };
    },
  };
  for (const operation of PRODUCT_OPERATIONS.filter(({ risk }) => risk.explicitConfirmation)) {
    const result = await dispatchTool(client, operation.mcp.name, {});
    assert.equal(result.isError, true, operation.id);
  }
  assert.equal(calls, 0);
});

test('stdio MCP sends mobile disclosure options in the query string', () => {
  assert.deepEqual(
    createOperationRequest('mobile.update', {
      projectId: 'project-id',
      enabled: true,
      includePublishableKey: true,
    }),
    {
      method: 'PATCH',
      url: '/api/v1/projects/project-id/mobile',
      params: { includePublishableKey: true },
      data: { enabled: true },
    },
  );
  assert.deepEqual(
    createOperationRequest('mobile.rotateKey', {
      projectId: 'project-id',
      confirm: true,
      includePublishableKey: true,
    }),
    {
      method: 'POST',
      url: '/api/v1/projects/project-id/mobile/rotate-key',
      params: { includePublishableKey: true },
      data: {},
    },
  );
});

test('stdio MCP returns structured errors for unknown tools', async () => {
  const client = { execute: async () => { throw new Error('must not run'); } };
  const result = await dispatchTool(client, 'unknown_tool', {});
  assert.equal(result.isError, true);
  assert.match(result.content[0]!.text, /Unknown tool/);
});

test('the prepublish check rejects version and tool drift', () => {
  assert.throws(() => verifyMcpParity('2.9.9'), /Package version differs/);
  assert.throws(
    () => verifyMcpParity('3.0.0', PRODUCT_OPERATIONS.slice(0, -1).map(({ mcp }) => mcp.name)),
    /MCP tool count differs/,
  );
});
