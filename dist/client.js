import axios, { AxiosError } from 'axios';
export class FeedbackBasketClient {
    api;
    constructor(apiKey, baseUrl = 'https://feedbackbasket.com') {
        this.api = axios.create({
            baseURL: `${baseUrl}/api/mcp`,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'FeedbackBasket-MCP/2.0.0',
            },
            timeout: 30000,
        });
    }
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
                const openCount = project.byStatus['OPEN'] || 0;
                const bugCount = project.byCategory['BUG'] || 0;
                return [
                    `**${project.name}**`,
                    `  ID: ${project.id}`,
                    `  URL: ${project.url}`,
                    `  Total Feedback: ${project.totalFeedback}`,
                    `  Open: ${openCount} | Bugs: ${bugCount}`,
                    ''
                ].join('\n');
            }).join('\n');
            return {
                content: [{
                        type: 'text',
                        text: `# FeedbackBasket Projects (${projects.length} total)\n\n${projectList}`
                    }]
            };
        }
        catch (error) {
            throw this.handleError('Failed to fetch projects', error);
        }
    }
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
                    .filter(([, value]) => value !== undefined)
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
                const priority = item.aiPriorityScore != null
                    ? ` | Priority: ${item.aiPriorityScore >= 70 ? 'HIGH' : item.aiPriorityScore >= 40 ? 'MEDIUM' : 'LOW'} (${item.aiPriorityScore}/100)`
                    : '';
                const lines = [
                    `**${category} | ${sentiment} | ${item.status}${priority}**`,
                    `Project: ${item.project.name}`,
                ];
                if (item.aiSummary)
                    lines.push(`Summary: ${item.aiSummary}`);
                lines.push(`Content: ${item.content.length > 150 ? item.content.substring(0, 150) + '...' : item.content}`);
                if (item.email)
                    lines.push(`Email: ${item.email}`);
                if (item.pageUrl)
                    lines.push(`Page: ${item.pageUrl}`);
                if (item.browser || item.os)
                    lines.push(`Browser: ${[item.browser, item.os, item.device].filter(Boolean).join(' | ')}`);
                if (item.notes && item.notes.length > 0) {
                    lines.push(`Notes: ${item.notes.map(n => `[${n.author.name}] ${n.content}`).join('; ')}`);
                }
                lines.push(`Created: ${new Date(item.createdAt).toLocaleDateString()}`);
                lines.push('');
                return lines.join('\n');
            }).join('\n');
            const { pagination } = response.data;
            return {
                content: [{
                        type: 'text',
                        text: [
                            `# Feedback Results (${feedback.length} of ${pagination.totalCount})\n`,
                            feedbackList,
                            pagination.hasMore ? `\n*Showing ${feedback.length} results. Use offset: ${pagination.offset + pagination.limit} to get more.*` : '',
                        ].join('\n')
                    }]
            };
        }
        catch (error) {
            throw this.handleError('Failed to fetch feedback', error);
        }
    }
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
                    .filter(([, value]) => value !== undefined)
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
                const statusMap = {
                    OPEN: '⏳', UNDER_REVIEW: '👁️', PLANNED: '📋',
                    IN_PROGRESS: '🔨', COMPLETE: '✅', CLOSED: '🔒'
                };
                const statusEmoji = statusMap[bug.status] || '❓';
                const lines = [
                    `${severityEmoji} **${bug.severity.toUpperCase()} SEVERITY** ${statusEmoji} ${bug.status}`,
                    `Project: ${bug.project.name}`,
                ];
                if (bug.aiSummary)
                    lines.push(`Summary: ${bug.aiSummary}`);
                lines.push(`Bug: ${bug.content.length > 150 ? bug.content.substring(0, 150) + '...' : bug.content}`);
                if (bug.email)
                    lines.push(`Reported by: ${bug.email}`);
                if (bug.pageUrl)
                    lines.push(`Page: ${bug.pageUrl}`);
                if (bug.browser || bug.os)
                    lines.push(`Browser: ${[bug.browser, bug.os, bug.device].filter(Boolean).join(' | ')}`);
                lines.push(`Reported: ${new Date(bug.createdAt).toLocaleDateString()}`);
                lines.push('');
                return lines.join('\n');
            }).join('\n');
            const stats = response.data.stats;
            const statsText = [
                `## Bug Statistics`,
                `Total Bugs: ${stats.total}`,
                `🔴 High: ${stats.bySeverity.high} | 🟡 Medium: ${stats.bySeverity.medium} | 🟢 Low: ${stats.bySeverity.low}`,
                `Open: ${stats.byStatus['OPEN'] || 0} | Under Review: ${stats.byStatus['UNDER_REVIEW'] || 0} | In Progress: ${stats.byStatus['IN_PROGRESS'] || 0} | Complete: ${stats.byStatus['COMPLETE'] || 0}`,
                ''
            ].join('\n');
            const { pagination } = response.data;
            return {
                content: [{
                        type: 'text',
                        text: [
                            `# Bug Reports (${bugReports.length} of ${pagination.totalCount})\n`,
                            statsText,
                            bugList,
                            pagination.hasMore ? `\n*Showing ${bugReports.length} results. Use offset: ${pagination.offset + pagination.limit} to get more.*` : '',
                        ].join('\n')
                    }]
            };
        }
        catch (error) {
            throw this.handleError('Failed to fetch bug reports', error);
        }
    }
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
            const responseMessage = error.response?.data?.error || error.response?.data?.message || error.message;
            if (status === 401) {
                return new Error(`Authentication failed: ${responseMessage}. Check your API key.`);
            }
            else if (status === 403) {
                return new Error(`Access denied: ${responseMessage}. Check your API key permissions.`);
            }
            else if (status === 429) {
                return new Error(`Rate limit exceeded. Please try again later.`);
            }
            else {
                return new Error(`${message}: ${responseMessage} (HTTP ${status})`);
            }
        }
        return new Error(`${message}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
