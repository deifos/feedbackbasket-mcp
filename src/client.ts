import axios, { AxiosError, type AxiosInstance } from 'axios';
import {
  AGENT_SURFACE_VERSION,
  getProductOperation,
  type ProductOperationId,
} from 'feedbackbasket-agent-contract';

export type McpOperationResult = {
  structuredContent: Record<string, unknown>;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

export type OperationRequest = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  params?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

export function createOperationRequest(
  operationId: ProductOperationId,
  rawArgs: Record<string, unknown>,
): OperationRequest {
  const operation = getProductOperation(operationId);
  if (!operation) throw new Error(`Unknown operation: ${operationId}`);
  const args = { ...rawArgs };
  const requestPath = operation.http.path.replace(/\{([^}]+)\}/g, (_match, name: string) => {
    const value = args[name];
    if (typeof value !== 'string' || value.length === 0) throw new Error(`${name} is required.`);
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
  const params: Record<string, unknown> = {};
  for (const name of operation.http.queryParameters) {
    if (name in args) {
      params[name] = args[name];
      delete args[name];
    }
  }
  if (operation.http.method === 'GET') Object.assign(params, args);
  return {
    method: operation.http.method,
    url: requestPath,
    ...(Object.keys(params).length > 0 ? { params } : {}),
    ...(operation.http.method === 'GET' ? {} : { data: args }),
  };
}

export class FeedbackBasketClient {
  private readonly api: AxiosInstance;

  constructor(apiKey: string, baseUrl = 'https://feedbackbasket.com') {
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

  async execute(
    operationId: ProductOperationId,
    rawArgs: Record<string, unknown>,
  ): Promise<McpOperationResult> {
    const request = createOperationRequest(operationId, rawArgs);
    try {
      const response = await this.api.request<unknown>({
        ...request,
        transformResponse: [(value: string) => {
          try { return JSON.parse(value) as unknown; } catch { return value; }
        }],
      });
      const structuredContent =
        response.data && typeof response.data === 'object' && !Array.isArray(response.data)
          ? response.data as Record<string, unknown>
          : { value: response.data };
      return {
        structuredContent,
        content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data as { error?: unknown; message?: unknown } | undefined;
      const responseMessage =
        typeof data?.error === 'string'
          ? data.error
          : typeof data?.message === 'string'
            ? data.message
            : error.message;
      if (status === 401) return new Error(`Authentication failed: ${responseMessage}.`);
      if (status === 403) return new Error(`Access denied: ${responseMessage}.`);
      if (status === 429) return new Error('Rate limit exceeded. Try again later.');
      return new Error(`FeedbackBasket request failed: ${responseMessage} (HTTP ${status ?? 'unknown'}).`);
    }
    return new Error(error instanceof Error ? error.message : 'FeedbackBasket request failed.');
  }
}
