export declare class FeedbackBasketClient {
    private api;
    constructor(apiKey: string, baseUrl?: string);
    listProjects(): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
    getFeedback(params?: {
        projectId?: string;
        category?: string;
        status?: string;
        sentiment?: string;
        limit?: number;
        offset?: number;
        search?: string;
        includeNotes?: boolean;
    }): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
    getBugReports(params?: {
        projectId?: string;
        status?: string;
        severity?: 'high' | 'medium' | 'low';
        limit?: number;
        offset?: number;
        search?: string;
        includeNotes?: boolean;
    }): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
    searchFeedback(query: string, options?: {
        projectId?: string;
        category?: string;
        limit?: number;
    }): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
    private handleError;
}
