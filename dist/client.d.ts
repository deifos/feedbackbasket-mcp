import { type ProductOperationId } from 'feedbackbasket-agent-contract';
export type McpOperationResult = {
    structuredContent: Record<string, unknown>;
    content: Array<{
        type: 'text';
        text: string;
    }>;
    isError?: boolean;
};
export type OperationRequest = {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    url: string;
    params?: Record<string, unknown>;
    data?: Record<string, unknown>;
};
export declare function createOperationRequest(operationId: ProductOperationId, rawArgs: Record<string, unknown>): OperationRequest;
export declare class FeedbackBasketClient {
    private readonly api;
    constructor(apiKey: string, baseUrl?: string);
    execute(operationId: ProductOperationId, rawArgs: Record<string, unknown>): Promise<McpOperationResult>;
    private handleError;
}
