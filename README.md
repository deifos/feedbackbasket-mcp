# FeedbackBasket MCP Server

Model Context Protocol (MCP) server for [FeedbackBasket](https://feedbackbasket.com). Version `3.0.0` provides the same 31 product operations as the FeedbackBasket CLI and live Streamable HTTP server.

Use a read key for queries. Use a full key for approved writes. A project-restricted key can access only its allowed projects. Project creation and team operations need an unrestricted full key. Each high-impact operation needs `confirm: true`.

You can use this stdio package or connect directly to `https://feedbackbasket.com/.well-known/mcp` with Streamable HTTP. Both transports use the same MCP key and contract.

## Installation & Setup

### 1. Generate API Key

1. Log into [feedbackbasket.com](https://feedbackbasket.com)
2. Go to **Settings** (sidebar)
3. Scroll to **MCP API Keys** section
4. Click **New API Key**
5. Name your key (e.g., "Claude Code", "Cursor", "Windsurf")
6. Select projects to grant access to (or leave empty for all projects)
7. Copy the generated key. It is shown only once. Keep it out of source, logs, prompts, and command history.

### 2. Configure Your Editor

#### Claude Code (CLI)

Set `FEEDBACKBASKET_API_KEY` in the environment that starts Claude Code. Then
add the server without putting the key in the command or shell history:

```bash
claude mcp add feedbackbasket -- npx -y feedbackbasket-mcp-server@3.0.0
```

On native Windows, use `cmd /c npx` as the command because Claude Code cannot
start `npx` directly there.

#### Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "feedbackbasket": {
      "command": "npx",
      "args": ["-y", "feedbackbasket-mcp-server@3.0.0"],
      "env": { "FEEDBACKBASKET_API_KEY": "${FEEDBACKBASKET_API_KEY}" }
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
      "args": ["-y", "feedbackbasket-mcp-server@3.0.0"],
      "env": { "FEEDBACKBASKET_API_KEY": "${FEEDBACKBASKET_API_KEY}" }
    }
  }
}
```

#### Environment Variable

Use an environment variable instead of the `--api-key` argument. This keeps
the key out of process listings and saved command history.

```json
{
  "mcpServers": {
    "feedbackbasket": {
      "command": "npx",
      "args": ["-y", "feedbackbasket-mcp-server@latest"],
      "env": {
        "FEEDBACKBASKET_API_KEY": "${FEEDBACKBASKET_API_KEY}"
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

<!-- BEGIN GENERATED AGENT CAPABILITIES -->
## Agent capability contract

Agent surface version: `3.0.0`. The CLI and both MCP transports implement the same 31 product operations.

| Product operation | CLI command | MCP tool | Required access | Confirm |
| --- | --- | --- | --- | --- |
| `projects.list` | `projects list` | `list_projects` | `read:projects` | No |
| `projects.get` | `projects show` | `get_project` | `read:projects; allowed project` | No |
| `projects.create` | `projects create` | `create_project` | `write:projects; unrestricted key` | No |
| `projects.update` | `projects update` | `update_project` | `write:projects; allowed project` | No |
| `projects.delete` | `projects delete` | `delete_project` | `write:projects; allowed project` | Yes |
| `feedback.list` | `feedback list` | `get_feedback` | `read:feedback; allowed project` | No |
| `feedback.get` | `feedback show` | `get_feedback_item` | `read:feedback; allowed project` | No |
| `feedback.search` | `feedback search` | `search_feedback` | `read:feedback; allowed project` | No |
| `feedback.create` | `feedback create` | `create_feedback` | `write:feedback; allowed project` | No |
| `feedback.update` | `feedback update` | `update_feedback` | `write:feedback; allowed project` | No |
| `feedback.delete` | `feedback delete` | `delete_feedback` | `write:feedback; allowed project` | Yes |
| `feedback.bulkUpdate` | `feedback bulk-update` | `bulk_update_feedback` | `write:feedback; allowed project` | Yes |
| `feedback.export` | `feedback export` | `export_feedback` | `read:feedback; allowed project` | No |
| `bugs.list` | `bugs list` | `get_bug_reports` | `read:feedback; allowed project` | No |
| `bugs.stats` | `bugs stats` | `get_bug_stats` | `read:feedback; allowed project` | No |
| `notes.create` | `feedback note` | `create_feedback_note` | `write:notes; allowed project` | No |
| `notes.update` | `feedback note update` | `update_feedback_note` | `write:notes; allowed project` | No |
| `notes.delete` | `feedback note delete` | `delete_feedback_note` | `write:notes; allowed project` | Yes |
| `replies.list` | `feedback replies` | `list_feedback_replies` | `read:feedback; allowed project` | No |
| `replies.send` | `feedback reply` | `send_feedback_reply` | `write:replies; allowed project` | Yes |
| `widget.getSettings` | `widget settings` | `get_widget_settings` | `read:projects; allowed project` | No |
| `widget.updateSettings` | `widget update`<br>`widget flow` | `update_widget_settings` | `write:widget; allowed project` | No |
| `widget.getScript` | `widget script` | `get_widget_script` | `read:projects; allowed project` | No |
| `mobile.get` | `mobile status`<br>`mobile verify` | `get_mobile_integration` | `read:projects; allowed project` | No |
| `mobile.update` | `mobile setup`<br>`mobile bundle`<br>`mobile conversations`<br>`mobile disable` | `update_mobile_integration` | `write:mobile; allowed project` | No |
| `mobile.rotateKey` | `mobile rotate-key` | `rotate_mobile_project_key` | `write:mobile; allowed project` | Yes |
| `waitlist.list` | `waitlist list` | `get_waitlist` | `read:feedback; allowed project` | No |
| `waitlist.export` | `waitlist export` | `export_waitlist` | `read:feedback; allowed project` | No |
| `team.list` | `team list` | `list_team_members` | `write:team; unrestricted key` | No |
| `team.updateRole` | `team role` | `update_team_member_role` | `write:team; unrestricted key` | Yes |
| `team.remove` | `team remove` | `remove_team_member` | `write:team; unrestricted key` | Yes |
<!-- END GENERATED AGENT CAPABILITIES -->

## Security & Privacy

- **Explicit access** — Read keys query data. Full keys can use approved write operations.
- **Project-level permissions** — Restricted keys can access only selected projects.
- **Confirmation** — High-impact operations do not run without explicit confirmation.
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
