#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { program } from 'commander';
import { FeedbackBasketClient } from './client.js';
// Parse command line arguments
program
    .option('--api-key <key>', 'FeedbackBasket API key')
    .option('--base-url <url>', 'Base URL for FeedbackBasket API', 'https://feedbackbasket.com')
    .parse();
const options = program.opts();
const apiKey = options.apiKey || process.env.FEEDBACKBASKET_API_KEY;
if (!apiKey) {
    console.error('Error: API key required.');
    console.error('Usage: Use --api-key option or set FEEDBACKBASKET_API_KEY environment variable');
    process.exit(1);
}
// Validate API key format
if (!/^fb_key_[a-f0-9]{64}$/.test(apiKey)) {
    console.error('Error: Invalid API key format. API keys should start with "fb_key_" followed by 64 hexadecimal characters.');
    process.exit(1);
}
const client = new FeedbackBasketClient(apiKey, options.baseUrl);
// Create MCP server
const server = new Server({
    name: 'feedbackbasket-mcp',
    version: '1.0.0',
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async (_request) => {
    return {
        tools: [
            {
                name: 'list_projects',
                description: 'List all FeedbackBasket projects accessible by your API key with summary statistics',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    additionalProperties: false,
                },
            },
            {
                name: 'get_feedback',
                description: 'Get feedback from your FeedbackBasket projects with filtering options',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'Filter by specific project ID',
                        },
                        category: {
                            type: 'string',
                            enum: ['BUG', 'FEATURE', 'REVIEW'],
                            description: 'Filter by feedback category',
                        },
                        status: {
                            type: 'string',
                            enum: ['PENDING', 'REVIEWED', 'DONE'],
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
                            description: 'Maximum number of results to return (default: 20, max: 100)',
                            minimum: 1,
                            maximum: 100,
                        },
                        includeNotes: {
                            type: 'boolean',
                            description: 'Include internal notes in the response (default: false)',
                        },
                    },
                    additionalProperties: false,
                },
            },
            {
                name: 'get_bug_reports',
                description: 'Get bug reports specifically from your FeedbackBasket projects',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'Filter by specific project ID',
                        },
                        status: {
                            type: 'string',
                            enum: ['PENDING', 'REVIEWED', 'DONE'],
                            description: 'Filter by bug status',
                        },
                        severity: {
                            type: 'string',
                            enum: ['high', 'medium', 'low'],
                            description: 'Filter by computed severity (based on sentiment: negative=high, neutral=medium, positive=low)',
                        },
                        search: {
                            type: 'string',
                            description: 'Search bug report content for specific text',
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of results to return (default: 20, max: 100)',
                            minimum: 1,
                            maximum: 100,
                        },
                        includeNotes: {
                            type: 'boolean',
                            description: 'Include internal notes in the response (default: false)',
                        },
                    },
                    additionalProperties: false,
                },
            },
            {
                name: 'search_feedback',
                description: 'Search for feedback across all accessible projects using text search',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query to find in feedback content',
                        },
                        projectId: {
                            type: 'string',
                            description: 'Limit search to specific project',
                        },
                        category: {
                            type: 'string',
                            enum: ['BUG', 'FEATURE', 'REVIEW'],
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
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
                const searchOptions = {};
                if (typeof args.projectId === 'string') {
                    searchOptions.projectId = args.projectId;
                }
                if (typeof args.category === 'string' && ['BUG', 'FEATURE', 'REVIEW'].includes(args.category)) {
                    searchOptions.category = args.category;
                }
                if (typeof args.limit === 'number') {
                    searchOptions.limit = args.limit;
                }
                return await client.searchFeedback(args.query, searchOptions);
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${errorMessage}`,
                },
            ],
            isError: true,
        };
    }
});
// Start the server
async function main() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        // Server is now running and will handle requests via stdio
        console.error('FeedbackBasket MCP server started successfully');
    }
    catch (error) {
        console.error('Failed to start MCP server:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.error('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.error('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
