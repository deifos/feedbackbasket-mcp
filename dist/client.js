import axios, { AxiosError } from 'axios';
import { AGENT_SURFACE_VERSION, getProductOperation, } from 'feedbackbasket-agent-contract';
export function createOperationRequest(operationId, rawArgs) {
    const operation = getProductOperation(operationId);
    if (!operation)
        throw new Error(`Unknown operation: ${operationId}`);
    const args = { ...rawArgs };
    const requestPath = operation.http.path.replace(/\{([^}]+)\}/g, (_match, name) => {
        const value = args[name];
        if (typeof value !== 'string' || value.length === 0)
            throw new Error(`${name} is required.`);
        delete args[name];
        return encodeURIComponent(value);
    });
    delete args.confirm;
    if (operationId === 'feedback.search') {
        args.search = args.query;
        delete args.query;
    }
    if (operationId === 'widget.updateSettings' && args.settings && typeof args.settings === 'object') {
        Object.assign(args, args.settings);
        delete args.settings;
    }
    const params = {};
    for (const name of operation.http.queryParameters) {
        if (name in args) {
            params[name] = args[name];
            delete args[name];
        }
    }
    if (operation.http.method === 'GET')
        Object.assign(params, args);
    return {
        method: operation.http.method,
        url: requestPath,
        ...(Object.keys(params).length > 0 ? { params } : {}),
        ...(operation.http.method === 'GET' ? {} : { data: args }),
    };
}
export class FeedbackBasketClient {
    api;
    constructor(apiKey, baseUrl = 'https://feedbackbasket.com') {
        this.api = axios.create({
            baseURL: baseUrl.replace(/\/$/, ''),
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': `FeedbackBasket-MCP/${AGENT_SURFACE_VERSION}`,
            },
            timeout: 30_000,
        });
    }
    async execute(operationId, rawArgs) {
        const request = createOperationRequest(operationId, rawArgs);
        try {
            const response = await this.api.request({
                ...request,
                transformResponse: [(value) => {
                        try {
                            return JSON.parse(value);
                        }
                        catch {
                            return value;
                        }
                    }],
            });
            const structuredContent = response.data && typeof response.data === 'object' && !Array.isArray(response.data)
                ? response.data
                : { value: response.data };
            return {
                structuredContent,
                content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
            };
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    handleError(error) {
        if (error instanceof AxiosError) {
            const status = error.response?.status;
            const data = error.response?.data;
            const responseMessage = typeof data?.error === 'string'
                ? data.error
                : typeof data?.message === 'string'
                    ? data.message
                    : error.message;
            if (status === 401)
                return new Error(`Authentication failed: ${responseMessage}.`);
            if (status === 403)
                return new Error(`Access denied: ${responseMessage}.`);
            if (status === 429)
                return new Error('Rate limit exceeded. Try again later.');
            return new Error(`FeedbackBasket request failed: ${responseMessage} (HTTP ${status ?? 'unknown'}).`);
        }
        return new Error(error instanceof Error ? error.message : 'FeedbackBasket request failed.');
    }
}
