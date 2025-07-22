#!/usr/bin/env node

import { spawn } from 'child_process';

// Replace with your actual API key
const API_KEY = process.env.API_KEY || 'fb_key_your_actual_key_here';

const testMCP = async () => {
  const mcp = spawn('node', ['dist/index.js', '--api-key', API_KEY], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  mcp.stdout.on('data', (data) => {
    output += data.toString();
  });

  mcp.stderr.on('data', (data) => {
    console.error('Error:', data.toString());
  });

  // Test list_tools
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };

  console.log('Sending list_tools request...');
  mcp.stdin.write(JSON.stringify(listToolsRequest) + '\n');

  // Test list_projects
  setTimeout(() => {
    const callToolRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'list_projects',
        arguments: {}
      }
    };

    console.log('Sending list_projects request...');
    mcp.stdin.write(JSON.stringify(callToolRequest) + '\n');

    // Close after a short delay
    setTimeout(() => {
      mcp.kill();
      console.log('Output received:');
      console.log(output);
    }, 2000);
  }, 1000);
};

console.log('Testing MCP server locally...');
testMCP().catch(console.error);