import axios, { AxiosError } from 'axios';
export class FeedbackBasketClient {
    api;
    constructor(apiKey, baseUrl = 'https://feedbackbasket.com') {
        this.api = axios.create({
            baseURL: `${baseUrl}/api/mcp`,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'FeedbackBasket-MCP/1.0.0',
            },
            timeout: 30000, // 30 second timeout
        });
    }
    /**
     * List all projects accessible by the API key
     */
    async listProjects() {
        try {
            const response = await this.api.post('/projects', {});
            const projects = response.data.projects;
            if (projects.length === 0) {
                return {
                    content: [{
                            type: 'text',
                            text: 'No projects found. Make sure your API key has access to projects in your FeedbackBasket dashboard.'
                        }]
                };
            }
            const projectList = projects.map(project => {
                const totalFeedback = project.stats.totalFeedback;
                const pendingCount = project.stats.byStatus.PENDING;
                const bugCount = project.stats.byCategory.BUG;
                return [
                    `**${project.name}**`,
                    `  URL: ${project.url}`,
                    `  Total Feedback: ${totalFeedback}`,
                    `  Pending: ${pendingCount} | Bugs: ${bugCount}`,
                    `  Created: ${new Date(project.createdAt).toLocaleDateString()}`,
                    ''
                ].join('\n');
            }).join('\n');
            const summary = [
                `# FeedbackBasket Projects (${projects.length} total)\n`,
                projectList,
                `\n*API Key: ${response.data.apiKeyInfo.name} (${response.data.apiKeyInfo.usageCount} uses)*`
            ].join('\n');
            return {
                content: [{
                        type: 'text',
                        text: summary
                    }]
            };
        }
        catch (error) {
            throw this.handleError('Failed to fetch projects', error);
        }
    }
    /**
     * Get feedback for projects
     */
    async getFeedback(params = {}) {
        try {
            const response = await this.api.post('/feedback', {
                limit: 20,
                includeNotes: false,
                ...params,
            });
            const feedback = response.data.feedback;
            if (feedback.length === 0) {
                const filters = Object.entries(params)
                    .filter(([_, value]) => value !== undefined)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
                return {
                    content: [{
                            type: 'text',
                            text: `No feedback found${filters ? ` with filters: ${filters}` : ''}.`
                        }]
                };
            }
            const feedbackList = feedback.map(item => {
                const category = item.category || 'UNCATEGORIZED';
                const sentiment = item.sentiment || 'UNKNOWN';
                const confidenceText = item.categoryConfidence
                    ? ` (${Math.round(item.categoryConfidence * 100)}% confidence)`
                    : '';
                return [
                    `**${category}${confidenceText} | ${sentiment} | ${item.status}**`,
                    `Project: ${item.project.name}`,
                    `Content: ${item.content.length > 100 ? item.content.substring(0, 100) + '...' : item.content}`,
                    item.email ? `Email: ${item.email}` : '',
                    item.notes && params.includeNotes ? `Notes: ${item.notes}` : '',
                    `Created: ${new Date(item.createdAt).toLocaleDateString()}`,
                    ''
                ].filter(Boolean).join('\n');
            }).join('\n');
            const summary = [
                `# Feedback Results (${feedback.length} of ${response.data.pagination.totalCount})\n`,
                feedbackList,
                response.data.pagination.hasMore ? `\n*Showing first ${feedback.length} results. Use offset parameter to get more.*` : '',
                `\n*API Key: ${response.data.apiKeyInfo.name}*`
            ].join('\n');
            return {
                content: [{
                        type: 'text',
                        text: summary
                    }]
            };
        }
        catch (error) {
            throw this.handleError('Failed to fetch feedback', error);
        }
    }
    /**
     * Get bug reports specifically
     */
    async getBugReports(params = {}) {
        try {
            const response = await this.api.post('/feedback/bugs', {
                limit: 20,
                includeNotes: false,
                ...params,
            });
            const bugReports = response.data.bugReports;
            if (bugReports.length === 0) {
                const filters = Object.entries(params)
                    .filter(([_, value]) => value !== undefined)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
                return {
                    content: [{
                            type: 'text',
                            text: `No bug reports found${filters ? ` with filters: ${filters}` : ''}.`
                        }]
                };
            }
            const bugList = bugReports.map(bug => {
                const severityEmoji = bug.severity === 'high' ? '🔴' : bug.severity === 'medium' ? '🟡' : '🟢';
                const statusEmoji = bug.status === 'PENDING' ? '⏳' : bug.status === 'REVIEWED' ? '👁️' : '✅';
                return [
                    `${severityEmoji} **${bug.severity.toUpperCase()} SEVERITY** ${statusEmoji} ${bug.status}`,
                    `Project: ${bug.project.name}`,
                    `Bug: ${bug.content.length > 150 ? bug.content.substring(0, 150) + '...' : bug.content}`,
                    bug.email ? `Reported by: ${bug.email}` : '',
                    bug.notes && params.includeNotes ? `Notes: ${bug.notes}` : '',
                    `Reported: ${new Date(bug.createdAt).toLocaleDateString()}`,
                    ''
                ].filter(Boolean).join('\n');
            }).join('\n');
            const stats = response.data.stats;
            const statsText = [
                `## Bug Statistics`,
                `Total Bugs: ${stats.totalBugs}`,
                `🔴 High: ${stats.bySeverity.high} | 🟡 Medium: ${stats.bySeverity.medium} | 🟢 Low: ${stats.bySeverity.low}`,
                `⏳ Pending: ${stats.byStatus.pending} | 👁️ Reviewed: ${stats.byStatus.reviewed} | ✅ Done: ${stats.byStatus.done}`,
                ''
            ].join('\n');
            const summary = [
                `# Bug Reports (${bugReports.length} of ${response.data.pagination.totalCount})\n`,
                statsText,
                bugList,
                response.data.pagination.hasMore ? `\n*Showing first ${bugReports.length} results. Use offset parameter to get more.*` : '',
                `\n*API Key: ${response.data.apiKeyInfo.name}*`
            ].join('\n');
            return {
                content: [{
                        type: 'text',
                        text: summary
                    }]
            };
        }
        catch (error) {
            throw this.handleError('Failed to fetch bug reports', error);
        }
    }
    /**
     * Search feedback across all accessible projects
     */
    async searchFeedback(query, options = {}) {
        return this.getFeedback({
            search: query,
            limit: options.limit || 10,
            ...(options.projectId && { projectId: options.projectId }),
            ...(options.category && { category: options.category }),
        });
    }
    handleError(message, error) {
        if (error instanceof AxiosError) {
            const status = error.response?.status;
            const responseMessage = error.response?.data?.message || error.message;
            if (status === 401) {
                return new Error(`Authentication failed: ${responseMessage}. Check your API key.`);
            }
            else if (status === 403) {
                return new Error(`Access denied: ${responseMessage}. Check your API key permissions.`);
            }
            else if (status === 429) {
                return new Error(`Rate limit exceeded: ${responseMessage}. Please try again later.`);
            }
            else {
                return new Error(`${message}: ${responseMessage} (HTTP ${status})`);
            }
        }
        return new Error(`${message}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
