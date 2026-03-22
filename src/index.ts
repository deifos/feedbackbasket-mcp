#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
  ListToolsRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { FeedbackBasketClient } from './client.js';

function parseArgs(args: string[]): { apiKey: string | undefined; baseUrl: string | undefined } {
  let apiKey: string | undefined;
  let baseUrl: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i] ?? '';
    if (arg.startsWith('--api-key')) {
      const eqIdx = arg.indexOf('=');
      apiKey = eqIdx > 0 ? arg.slice(eqIdx + 1) : args[++i];
    } else if (arg.startsWith('--base-url')) {
      const eqIdx = arg.indexOf('=');
      baseUrl = eqIdx > 0 ? arg.slice(eqIdx + 1) : args[++i];
    }
  }
  return { apiKey, baseUrl };
}

const options = parseArgs(process.argv.slice(2));
const apiKey = options.apiKey || process.env.FEEDBACKBASKET_API_KEY;
const baseUrl = options.baseUrl || 'https://feedbackbasket.com';

if (!apiKey) {
  console.error('Error: API key required.');
  console.error('Usage: --api-key <key> or set FEEDBACKBASKET_API_KEY env var');
  process.exit(1);
}

if (!apiKey.startsWith('fb_key_')) {
  console.error('Error: Invalid API key format. Keys should start with "fb_key_".');
  process.exit(1);
}

const client = new FeedbackBasketClient(apiKey, baseUrl);

const server = new Server({
  name: 'feedbackbasket-mcp',
  version: '2.0.0',
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler(ListToolsRequestSchema, async (_request: ListToolsRequest) => {
  return {
    tools: [
      {
        name: 'list_projects',
        description: 'List all FeedbackBasket projects accessible by your API key with summary statistics including feedback counts by status and category',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
      {
        name: 'get_feedback',
        description: 'Get feedback from your FeedbackBasket projects with filtering. Returns AI analysis (summary, priority, category, sentiment), page URL, browser info, and optional notes.',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Filter by specific project ID',
            },
            category: {
              type: 'string',
              enum: ['BUG', 'FEATURE_REQUEST', 'IMPROVEMENT', 'QUESTION'],
              description: 'Filter by feedback category',
            },
            status: {
              type: 'string',
              enum: ['OPEN', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'COMPLETE', 'CLOSED'],
              description: 'Filter by feedback status',
            },
            sentiment: {
              type: 'string',
              enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
              description: 'Filter by sentiment analysis result',
            },
            search: {
              type: 'string',
              description: 'Search feedback content for specific text',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 20, max: 100)',
              minimum: 1,
              maximum: 100,
            },
            offset: {
              type: 'number',
              description: 'Offset for pagination (default: 0)',
              minimum: 0,
            },
            includeNotes: {
              type: 'boolean',
              description: 'Include internal team notes (default: false)',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'get_bug_reports',
        description: 'Get bug reports from your FeedbackBasket projects with severity classification (high/medium/low based on sentiment) and statistics',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Filter by specific project ID',
            },
            status: {
              type: 'string',
              enum: ['OPEN', 'UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'COMPLETE', 'CLOSED'],
              description: 'Filter by bug status',
            },
            severity: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Filter by severity (high=negative sentiment, medium=neutral, low=positive)',
            },
            search: {
              type: 'string',
              description: 'Search bug report content',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 20, max: 100)',
              minimum: 1,
              maximum: 100,
            },
            offset: {
              type: 'number',
              description: 'Offset for pagination',
              minimum: 0,
            },
            includeNotes: {
              type: 'boolean',
              description: 'Include internal team notes (default: false)',
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'search_feedback',
        description: 'Search for feedback across all accessible projects using text search. Useful for finding specific issues or topics.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search text to find in feedback content',
            },
            projectId: {
              type: 'string',
              description: 'Limit search to a specific project',
            },
            category: {
              type: 'string',
              enum: ['BUG', 'FEATURE_REQUEST', 'IMPROVEMENT', 'QUESTION'],
              description: 'Filter search results by category',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 10)',
              minimum: 1,
              maximum: 50,
            },
          },
          required: ['query'],
          additionalProperties: false,
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_projects':
        return await client.listProjects();

      case 'get_feedback':
        return await client.getFeedback(args || {});

      case 'get_bug_reports':
        return await client.getBugReports(args || {});

      case 'search_feedback':
        if (!args || typeof args !== 'object' || !('query' in args) || typeof args.query !== 'string') {
          throw new Error('Search query is required');
        }
        const searchOpts: { projectId?: string; category?: string; limit?: number } = {};
        if (typeof args.projectId === 'string') searchOpts.projectId = args.projectId;
        if (typeof args.category === 'string') searchOpts.category = args.category;
        if (typeof args.limit === 'number') searchOpts.limit = args.limit;
        return await client.searchFeedback(args.query, searchOpts);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('FeedbackBasket MCP server v2.0.0 started');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
