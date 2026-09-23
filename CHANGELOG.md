# Changelog

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
