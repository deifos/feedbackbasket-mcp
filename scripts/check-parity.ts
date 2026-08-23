import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AGENT_SURFACE_VERSION, PRODUCT_OPERATIONS } from 'feedbackbasket-agent-contract';
import { MCP_TOOLS } from '../src/index.js';

export function verifyMcpParity(
  packageVersion: string,
  toolNames: readonly string[] = MCP_TOOLS.map(({ name }) => name),
): void {
  assert.equal(packageVersion, AGENT_SURFACE_VERSION, 'Package version differs from the contract.');
  assert.equal(toolNames.length, PRODUCT_OPERATIONS.length, 'MCP tool count differs from the contract.');
  assert.deepEqual(toolNames, PRODUCT_OPERATIONS.map(({ mcp }) => mcp.name));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8')) as { version: string };
  verifyMcpParity(packageJson.version);
  console.log(`FeedbackBasket MCP ${AGENT_SURFACE_VERSION}: ${MCP_TOOLS.length} tools`);
}
