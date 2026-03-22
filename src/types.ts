// Shared types for the MCP server — aligned with FeedbackBasket v3

export interface Project {
  id: string;
  name: string;
  url: string;
  description?: string;
  createdAt: string;
  totalFeedback: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface Feedback {
  id: string;
  content: string;
  email?: string | null;
  status: 'OPEN' | 'UNDER_REVIEW' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETE' | 'CLOSED';
  category?: 'BUG' | 'FEATURE_REQUEST' | 'IMPROVEMENT' | 'QUESTION' | null;
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | null;
  aiSummary?: string | null;
  aiPriorityScore?: number | null;
  reasoning?: string | null;
  pageUrl?: string | null;
  browser?: string | null;
  os?: string | null;
  device?: string | null;
  language?: string | null;
  project: {
    id: string;
    name: string;
  };
  notes?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: { name: string };
  }>;
  createdAt: string;
}

export interface BugReport extends Feedback {
  severity: 'high' | 'medium' | 'low';
}

export interface ProjectsResponse {
  projects: Project[];
  totalProjects: number;
}

export interface FeedbackResponse {
  feedback: Feedback[];
  pagination: {
    totalCount: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface BugReportsResponse {
  bugReports: BugReport[];
  stats: {
    total: number;
    bySeverity: {
      high: number;
      medium: number;
      low: number;
    };
    byStatus: Record<string, number>;
  };
  pagination: {
    totalCount: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
