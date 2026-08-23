#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import {
  AGENT_SURFACE_VERSION,
  PRODUCT_OPERATIONS,
  getProductOperationByTool,
  validateOperationInput,
  type ProductOperationId,
} from 'feedbackbasket-agent-contract';
import { FeedbackBasketClient, type McpOperationResult } from './client.js';

export const MCP_TOOLS = PRODUCT_OPERATIONS.map((operation) => ({
  name: operation.mcp.name,
  title: operation.mcp.title,
  description: operation.mcp.description,
  inputSchema: operation.mcp.inputSchema,
  outputSchema: operation.mcp.outputSchema,
  annotations: {
    readOnlyHint: operation.risk.readOnly,
    destructiveHint: operation.risk.destructive,
    idempotentHint: operation.risk.idempotent,
    openWorldHint: operation.risk.openWorld,
  },
}));

export function parseArgs(args: string[]): { apiKey?: string; baseUrl?: string } {
  const result: { apiKey?: string; baseUrl?: string } = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index] ?? '';
    if (arg === '--api-key') {
      const value = args[++index];
      if (value !== undefined) result.apiKey = value;
    }
    else if (arg.startsWith('--api-key=')) result.apiKey = arg.slice('--api-key='.length);
    else if (arg === '--base-url') {
      const value = args[++index];
      if (value !== undefined) result.baseUrl = value;
    }
    else if (arg.startsWith('--base-url=')) result.baseUrl = arg.slice('--base-url='.length);
  }
  return result;
}

export async function dispatchTool(
  client: Pick<FeedbackBasketClient, 'execute'>,
  name: string,
  args: unknown,
): Promise<McpOperationResult> {
  const operation = getProductOperationByTool(name);
  if (!operation) return errorResult(`Unknown tool: ${name}`);
  const input = args && typeof args === 'object' && !Array.isArray(args)
    ? args as Record<string, unknown>
    : {};
  const validation = validateOperationInput(operation, input);
  if (!validation.valid) return errorResult(validation.message);
  try {
    return await client.execute(operation.id as ProductOperationId, input);
  } catch (error) {
    return errorResult(error instanceof Error ? error.message : 'FeedbackBasket request failed.');
  }
}

function errorResult(message: string): McpOperationResult {
  const structuredContent = { error: message };
  return {
    structuredContent,
    content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
    isError: true,
  };
}

export function createServer(client: FeedbackBasketClient): Server {
  const server = new Server(
    { name: 'feedbackbasket-mcp', version: AGENT_SURFACE_VERSION },
    { capabilities: { tools: {} } },
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: MCP_TOOLS }));
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) =>
    dispatchTool(client, request.params.name, request.params.arguments),
  );
  return server;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const apiKey = options.apiKey || process.env.FEEDBACKBASKET_API_KEY;
  if (!apiKey) throw new Error('API key required. Use --api-key or FEEDBACKBASKET_API_KEY.');
  if (!/^fb_key_[a-f0-9]{64}$/.test(apiKey)) throw new Error('Invalid API key format.');
  const server = createServer(new FeedbackBasketClient(apiKey, options.baseUrl));
  await server.connect(new StdioServerTransport());
  console.error(`FeedbackBasket MCP server v${AGENT_SURFACE_VERSION} started`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : 'MCP server failed.');
    process.exit(1);
  });
}
