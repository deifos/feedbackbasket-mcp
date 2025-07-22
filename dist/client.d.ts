export declare class FeedbackBasketClient {
    private api;
    constructor(apiKey: string, baseUrl?: string);
    /**
     * List all projects accessible by the API key
     */
    listProjects(): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
    /**
     * Get feedback for projects
     */
    getFeedback(params?: {
        projectId?: string;
        category?: 'BUG' | 'FEATURE' | 'REVIEW';
        status?: 'PENDING' | 'REVIEWED' | 'DONE';
        sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
        limit?: number;
        search?: string;
        includeNotes?: boolean;
    }): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
    /**
     * Get bug reports specifically
     */
    getBugReports(params?: {
        projectId?: string;
        status?: 'PENDING' | 'REVIEWED' | 'DONE';
        severity?: 'high' | 'medium' | 'low';
        limit?: number;
        search?: string;
        includeNotes?: boolean;
    }): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
    /**
     * Search feedback across all accessible projects
     */
    searchFeedback(query: string, options?: {
        projectId?: string;
        category?: 'BUG' | 'FEATURE' | 'REVIEW';
        limit?: number;
    }): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
    private handleError;
}
