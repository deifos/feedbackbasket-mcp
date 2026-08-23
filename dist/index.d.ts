#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { FeedbackBasketClient, type McpOperationResult } from './client.js';
export declare const MCP_TOOLS: {
    name: string;
    title: string;
    description: string;
    inputSchema: Readonly<Record<string, unknown>>;
    outputSchema: Readonly<Record<string, unknown>>;
    annotations: {
        readOnlyHint: boolean;
        destructiveHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
    };
}[];
export declare function parseArgs(args: string[]): {
    apiKey?: string;
    baseUrl?: string;
};
export declare function dispatchTool(client: Pick<FeedbackBasketClient, 'execute'>, name: string, args: unknown): Promise<McpOperationResult>;
export declare function createServer(client: FeedbackBasketClient): Server;
