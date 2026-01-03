# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-03

### Added
- Simple `browse <url>` command for scraping any webpage
- WebSocket daemon architecture for browser-CLI communication
- Chrome extension (Manifest V3) for capturing authenticated sessions
- High-quality HTML to Markdown conversion using Turndown
- `--json` flag for structured output with metadata
- `--html` flag for pruned HTML output
- `--wait` option for dynamic content loading
- `--scroll` option for infinite-scroll pages
- Claude Code skill integration
- Homebrew tap for easy installation

### Changed
- Complete architecture rewrite from multi-command CLI to single unified command
- Simplified from platform-specific scrapers to generic webpage scraping
- New extension replaces previous Playwriter dependency

### Removed
- Twitter-specific scraping commands
- LinkedIn-specific scraping commands
- Browser control commands (navigate, screenshot, etc.)
- MCP server functionality
- Platform-specific parsing utilities

## [0.2.0] - 2025-01-02

### Added
- Twitter likes scraping
- Twitter Lists support
- Thread detection improvements

### Fixed
- Export conflicts
- Selector support issues

## [0.1.0] - 2024-12-XX

### Added
- Initial release
- Twitter profile, timeline, and post scraping
- LinkedIn profile and posts scraping
- Generic page scraping
- Browser control commands
