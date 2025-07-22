# FeedbackBasket MCP Server

Model Context Protocol (MCP) server for FeedbackBasket that allows AI assistants to query your project feedback and bug reports.

## Features

- 🔍 **List Projects** - View all your FeedbackBasket projects with summary statistics
- 📝 **Get Feedback** - Retrieve feedback with filtering by category, status, sentiment, and more
- 🐛 **Get Bug Reports** - Specifically fetch bug reports with severity classification
- 🔎 **Search Feedback** - Search across all feedback content using text queries
- 🔐 **Secure Authentication** - Uses API keys with project-level access control
- 📊 **Rich Statistics** - Get counts by category, status, sentiment, and severity

## Installation & Setup

### 1. Generate API Key

First, you'll need to create an API key from your FeedbackBasket account:

1. **Visit** [feedbackbasket.com](https://feedbackbasket.com) and log into your account
2. **Navigate** to your Account Settings (click your profile → Account)
3. **Find** the "MCP API Keys" section
4. **Click** "New API Key"
5. **Name your key** (e.g., "Claude Desktop", "Cursor IDE", "Windsurf")
6. **Select projects** you want to grant access to (or leave empty for all projects)
7. **Copy the generated API key** (starts with `fb_key_`) - you'll only see the full key once!

> 💡 **Tip**: You can manage your API keys anytime from your account settings at [feedbackbasket.com/account](https://feedbackbasket.com/account)

### 2. Configure Your Editor

Add the MCP server to your editor's configuration:

#### Quick Setup (All Editors)
```json
{
  "mcpServers": {
    "feedbackbasket": {
      "command": "npx",
      "args": ["-y", "@feedbackbasket/mcp-server@latest", "--api-key", "fb_key_your_api_key_here"]
    }
  }
}
```

#### Detailed Examples

#### Claude Desktop
```json
{
  "mcpServers": {
    "feedbackbasket": {
      "command": "npx",
      "args": [
        "-y",
        "@feedbackbasket/mcp-server@latest",
        "--api-key",
        "fb_key_your_api_key_here"
      ]
    }
  }
}
```

#### Cursor/Windsurf
```json
{
  "mcpServers": {
    "feedbackbasket": {
      "command": "npx",
      "args": [
        "-y",
        "@feedbackbasket/mcp-server@latest",
        "--api-key",
        "fb_key_your_api_key_here"
      ]
    }
  }
}
```

#### Environment Variable (Alternative)
```json
{
  "mcpServers": {
    "feedbackbasket": {
      "command": "npx",
      "args": ["-y", "@feedbackbasket/mcp-server@latest"],
      "env": {
        "FEEDBACKBASKET_API_KEY": "fb_key_your_api_key_here"
      }
    }
  }
}
```

## Usage Examples

Once configured, you can ask your AI assistant:

### Project Overview
- "Show me all my FeedbackBasket projects"
- "What projects do I have and how much feedback do they have?"

### Bug Reports
- "Show me all bug reports from my projects"
- "Get high severity bug reports that are still pending"
- "Find bug reports for my main website project"

### Feedback Analysis
- "Show me negative feedback from the last week"
- "Get all feature requests from my mobile app project"
- "Search for feedback containing 'login error'"

### Filtering & Search
- "Show me reviewed feedback with positive sentiment"
- "Find all pending bug reports with high severity"
- "Search for feedback about 'payment issues' in my e-commerce project"

## Available Tools

### `list_projects`
Lists all projects accessible by your API key with summary statistics.

### `get_feedback`
Retrieves feedback with optional filtering:
- `projectId` - Filter by specific project
- `category` - Filter by BUG, FEATURE, or REVIEW
- `status` - Filter by PENDING, REVIEWED, or DONE
- `sentiment` - Filter by POSITIVE, NEGATIVE, or NEUTRAL
- `search` - Text search in feedback content
- `limit` - Number of results (max 100)
- `includeNotes` - Include internal notes

### `get_bug_reports`
Specifically fetches bug reports with computed severity:
- `projectId` - Filter by specific project
- `status` - Filter by bug status
- `severity` - Filter by high, medium, or low severity
- `search` - Text search in bug reports
- `limit` - Number of results (max 100)
- `includeNotes` - Include internal notes

### `search_feedback`
Searches feedback content across all accessible projects:
- `query` - Search text (required)
- `projectId` - Limit to specific project
- `category` - Filter by category
- `limit` - Number of results (max 50)

## Security & Privacy

- ✅ **Read-only access** - MCP server can only read data, never modify
- ✅ **Project-level permissions** - Grant access only to specific projects
- ✅ **API key authentication** - Secure token-based authentication
- ✅ **Usage tracking** - Monitor API key usage in your dashboard
- ✅ **Revokable access** - Instantly deactivate API keys if needed
- ✅ **Subscription limits respected** - Only returns feedback within your plan limits

## Troubleshooting

### "Invalid or missing API key"
- Check that your API key starts with `fb_key_`
- Ensure the API key is still active in your dashboard
- Verify the API key has access to at least one project

### "No projects found"
- Make sure your API key has been granted access to projects
- Check that you have projects in your FeedbackBasket account

### "Authentication failed"
- Verify your API key hasn't been revoked
- Check that the API key format is correct (71 characters, starts with `fb_key_`)

### Installation Issues
- Ensure you have Node.js installed
- Try clearing npx cache: `npx clear-npx-cache`
- Check your internet connection for package downloads

## API Key Management

Visit your [FeedbackBasket dashboard](https://feedbackbasket.com/dashboard/settings) to:
- Generate new API keys
- Manage project access for existing keys
- View usage statistics
- Deactivate or delete keys
- Monitor key activity

## Support

- 🐛 Issues: [GitHub Issues](https://github.com/deifos/feedbackbasket-mcp/issues)
- 📖 Docs: [FeedbackBasket Documentation](https://feedbackbasket.com/docs)