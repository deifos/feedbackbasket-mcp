# 3.10.0 — 2026-10-20

- `update_roadmap_settings` accepts `hiddenColumns`, and `get_roadmap_settings` returns it. Columns that still have cards cannot be hidden.
- `update_widget_settings` documents the `feedback_voting` widget template.
- Match contract 3.10.0 across the CLI and both MCP transports (61 operations).

# 3.9.0

- Add project reply permissions, personal Telegram connections, and agent reply drafts.
- Agents need an explicit project SEND grant before sending customer replies.

## 3.8.0 — 2026-10-19

- Add private Telegram connection, test, disconnect, and per-project notification controls.
- Match contract 3.8.0 across the CLI and both MCP transports (58 operations).

# 3.7.0

- Add board settings, published feedback with vote counts, current vote records, and roadmap settings and card management.
- Keep all 53 operations aligned with contract 3.7.0.

# 3.5.1 — 2026-10-04

## 3.6.0

- Publish or withdraw reviewed feedback on public boards through the shared publication field.
- Use agent contract 3.6.0. Existing feedback remains private until approved.

- Corrected risk labels for note replacement, mobile access changes, draft rejection, and GitHub automation in the shared contract.

# 3.5.0 — 2026-10-03

- Updated the shared agent contract to 3.5.0. Remote HTTP MCP adds feedback events under an explicit transport parity exemption.

# Changelog

## [3.4.0] - 2026-10-04

### Added

- Added `list_themes` and `get_theme` for feedback that several people reported.
- Added `get_github_status`, `draft_github_issue`, and `create_github_issue` to turn a theme or feedback item into a GitHub issue.
- Added `list_github_issue_drafts`, `approve_github_issue_draft`, and `reject_github_issue_draft` to review issues proposed by automation.
- Added `update_github_automation` to control automatic issue creation and closing the loop.

### Changed

- The CLI and both MCP transports use the same 42-operation contract.
- Creating or approving a GitHub issue and changing automation require explicit confirmation.

## [3.3.0] - 2026-09-23

### Added

- Added team invitations and member project access changes, with explicit confirmation.
- Team lists now include project access settings.

### Changed

- Existing credentials are limited by current member project access on each request.
- The CLI and both MCP transports use the same 33-operation contract.

## [3.2.0] - 2026-09-04

### Added

- Added structured close reasons and optional internal close notes to feedback tools.

### Changed

- Closing feedback now requires a close reason. The `OTHER` reason also requires a close note.
- The package and shared contract now report version `3.2.0`.

## [3.1.0] - 2026-08-22

### Added

- Documented browser OAuth as the recommended remote Streamable HTTP setup.

### Changed

- The STDIO package remains API-key based for local, CI, server, and unattended use.
- The package and shared contract now report version `3.1.0` with the same 31 operations.

## [3.0.0] - 2026-08-22

### Added

- Added the complete 31-tool FeedbackBasket product-operation contract.
- Added structured MCP output, tool schemas, annotations, input checks, and confirmation checks.
- Added parity, protocol, client-path, build, and package release checks.

### Changed

- Read and full keys now follow the same scopes and project restrictions as the live MCP server.
- The package, server, and shared contract now use version `3.0.0`.
