# FeedbackBasket MCP Server

Model Context Protocol (MCP) server for [FeedbackBasket](https://feedbackbasket.com) that allows AI assistants to query your project feedback, bug reports, and AI analysis data.

## Features

- **List Projects** — View all projects with feedback counts by status and category
- **Get Feedback** — Retrieve feedback with filtering by category, status, sentiment, priority, and more
- **Get Bug Reports** — Fetch bug reports with severity classification and statistics
- **Search Feedback** — Search across all feedback content using text queries
- **AI-Enriched Data** — Every feedback item includes AI summary, priority score, category, and sentiment
- **Browser Context** — See page URL, browser, OS, and device info for each submission
- **Secure** — API key authentication with project-level access control

## Installation & Setup

### 1. Generate API Key

1. Log into [feedbackbasket.com](https://feedbackbasket.com)
2. Go to **Settings** (sidebar)
3. Scroll to **MCP API Keys** section
4. Click **New API Key**
5. Name your key (e.g., "Claude Code", "Cursor", "Windsurf")
6. Select projects to grant access to (or leave empty for all projects)
7. Copy the generated key (`fb_key_...`) — you'll only see it once!

### 2. Configure Your Editor

#### Claude Code (CLI)

```bash
claude mcp add feedbackbasket -- npx -y feedbackbasket-mcp-server@latest --api-key fb_key_YOUR_KEY
```

#### Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "feedbackbasket": {
      "command": "npx",
      "args": ["-y", "feedbackbasket-mcp-server@latest", "--api-key", "fb_key_YOUR_KEY"]
    }
  }
}
```

#### Cursor / Windsurf

Add to your MCP config (`.cursor/mcp.json` or equivalent):

```json
{
  "mcpServers": {
    "feedbackbasket": {
      "command": "npx",
      "args": ["-y", "feedbackbasket-mcp-server@latest", "--api-key", "fb_key_YOUR_KEY"]
    }
  }
}
```

#### Environment Variable (Alternative)

Instead of passing `--api-key` as an argument, you can use an environment variable:

```json
{
  "mcpServers": {
    "feedbackbasket": {
      "command": "npx",
      "args": ["-y", "feedbackbasket-mcp-server@latest"],
      "env": {
        "FEEDBACKBASKET_API_KEY": "fb_key_YOUR_KEY"
      }
    }
  }
}
```

## Usage Examples

Once configured, ask your AI assistant:

### Project Overview
- "Show me all my FeedbackBasket projects"
- "How much feedback does each project have?"

### Bug Reports
- "Show me all open bug reports"
- "Get high severity bugs that haven't been addressed"
- "Find bugs related to authentication"

### Feedback Analysis
- "Show me negative feedback from my project"
- "Get all feature requests"
- "What are users asking for the most?"
- "Show me high priority feedback"

### Search
- "Search for feedback about 'payment issues'"
- "Find feedback mentioning 'mobile'"

### Agentic Workflows
- "Look at my bug reports and suggest which ones to fix first"
- "Summarize this week's feedback trends"
- "Are users happy with the new checkout flow?"

## Available Tools

### `list_projects`
Lists all projects accessible by your API key with summary statistics.

### `get_feedback`
Retrieves feedback with optional filtering:
- `projectId` — Filter by specific project
- `category` — `BUG`, `FEATURE_REQUEST`, `IMPROVEMENT`, or `QUESTION`
- `status` — `OPEN`, `UNDER_REVIEW`, `PLANNED`, `IN_PROGRESS`, `COMPLETE`, or `CLOSED`
- `sentiment` — `POSITIVE`, `NEGATIVE`, or `NEUTRAL`
- `search` — Text search in feedback content
- `limit` — Number of results (default: 20, max: 100)
- `offset` — Pagination offset
- `includeNotes` — Include internal team notes

Each feedback item includes:
- AI summary and priority score (0-100)
- Category and sentiment classification
- Page URL where feedback was submitted
- Browser, OS, and device information

### `get_bug_reports`
Fetches bug reports with computed severity:
- `projectId` — Filter by specific project
- `status` — Filter by bug status
- `severity` — `high`, `medium`, or `low` (based on sentiment)
- `search` — Text search in bug reports
- `limit` / `offset` — Pagination
- `includeNotes` — Include internal team notes

Returns bug statistics: total count, breakdown by severity and status.

### `search_feedback`
Searches feedback content across all accessible projects:
- `query` — Search text (required)
- `projectId` — Limit to specific project
- `category` — Filter by category
- `limit` — Number of results (default: 10, max: 50)

## Security & Privacy

- **Read-only access** — MCP server can only read data, never modify
- **Project-level permissions** — Grant access only to specific projects
- **API key authentication** — Secure token-based authentication
- **Usage tracking** — Monitor API key usage from your Settings page
- **Revokable access** — Deactivate or delete API keys instantly

## Troubleshooting

### "Invalid or missing API key"
- Check that your API key starts with `fb_key_`
- Ensure the key is still active in Settings > MCP API Keys
- Verify the key has access to at least one project

### "No projects found"
- Make sure your API key has been granted access to projects
- Check that you have projects in your FeedbackBasket account

### Connection Issues
- Ensure Node.js 18+ is installed
- Try clearing npx cache: `npx clear-npx-cache`
- For local development, add `--base-url http://localhost:3000`

## API Key Management

Visit [feedbackbasket.com/dashboard/settings](https://feedbackbasket.com/dashboard/settings) to:
- Generate new API keys
- Manage project access
- View usage statistics
- Activate/deactivate keys
- Delete keys

## Links

- [FeedbackBasket](https://feedbackbasket.com)
- [GitHub Issues](https://github.com/deifos/feedbackbasket-mcp/issues)
