// Shared types for the MCP server based on actual database schema

export interface Project {
  id: string;
  name: string;
  url: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalFeedback: number;
    byCategory: {
      BUG: number;
      FEATURE: number;
      REVIEW: number;
      UNKNOWN: number;
    };
    byStatus: {
      PENDING: number;
      REVIEWED: number;
      DONE: number;
    };
  };
}

export interface Feedback {
  id: string;
  content: string;
  email?: string;
  status: 'PENDING' | 'REVIEWED' | 'DONE';
  notes?: string;
  category?: 'BUG' | 'FEATURE' | 'REVIEW';
  categorySource: 'manual' | 'ai';
  categoryConfidence?: number;
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sentimentSource: 'manual' | 'ai';
  sentimentConfidence?: number;
  isAiAnalyzed: boolean;
  aiAnalyzedAt?: string;
  aiReasoning?: string;
  project: {
    id: string;
    name: string;
    url: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Bug report is just feedback with category = 'BUG', plus computed severity
export interface BugReport extends Feedback {
  severity: 'high' | 'medium' | 'low'; // Computed from sentiment (NEGATIVE=high, NEUTRAL=medium, POSITIVE=low)
}

export interface FeedbackBasketResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface ProjectsResponse {
  projects: Project[];
  totalProjects: number;
  apiKeyInfo: {
    name: string;
    usageCount: number;
  };
}

export interface FeedbackResponse {
  feedback: Feedback[];
  pagination: {
    totalCount: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    nextOffset: number | null;
  };
  filters: {
    projectId?: string;
    category?: string;
    status?: string;
    sentiment?: string;
    search?: string;
  };
  apiKeyInfo: {
    name: string;
    usageCount: number;
  };
}

export interface BugReportsResponse {
  bugReports: BugReport[];
  stats: {
    totalBugs: number;
    bySeverity: {
      high: number;
      medium: number;
      low: number;
    };
    byStatus: {
      pending: number;
      reviewed: number;
      done: number;
    };
  };
  pagination: {
    totalCount: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    nextOffset: number | null;
  };
  filters: {
    projectId?: string;
    status?: string;
    severity?: string;
    search?: string;
  };
  apiKeyInfo: {
    name: string;
    usageCount: number;
  };
}