# Changelog

All notable changes to Claude Codex are documented here.

## v1.4.0 - 2026-02-09

### New Features

- Added a plugin install command bar that generates copy-paste CLI commands for installing and removing plugins
- Added app detail pages with automatic syncing of plugin components from GitHub repositories
- Added cross-references between plugins, explore mode for discovering related items, and a My Repos tab
- Added new session management commands: save-to-notion, changelog, and changelog settings
- Added changelog page to the dashboard with version badges and colored type pills

### Bug Fixes

- Fixed plugin detail pages returning a 500 error due to an SSR import issue
- Fixed plugin cards navigating to a dead page instead of toggling selection
- Fixed sync to check both nested and root-level item directories

## v1.3.0 - 2026-02-09

### New Features

- Added component detail modals showing full source markdown for each plugin item
- Added a complete plugin catalog with 146 plugins, including install tracking and active/inactive toggling
- Added integration with the JB Cloud App Tracker for managing deployed applications

### Bug Fixes

- Fixed database initialization to use lazy loading with automatic schema migration

## v1.2.0 - 2026-02-06

### New Features

- Added a collapsible sidebar with tabbed palette chips and double-click quick-add for faster navigation
- Added a visual command composer for building complex workflows from components
- Added an interactive dependency graph for visualizing relationships between plugins
- Added toast notifications to replace browser alert dialogs for a smoother experience
- Added plugin detail pages with source badge, component type badges, and GitHub links

### Bug Fixes

- Fixed sticky sidebar, dark scrollbar styling, pagination controls, and resizable composer panels
- Fixed 3 pre-existing build failures that were blocking deployment

### Security

- Removed hardcoded secrets and added hookify security rules

## v1.1.0 - 2026-02-05

### New Features

- Added live interactive component previews with adjustable card sizes in the marketplace
- Added component previews and documentation links to marketplace cards
- Added a full marketplace page to the dashboard
- Added dashboard view toggle and marketplace browsing API
- Added an admin dashboard with data generation, API routes, and full CRUD management

### Bug Fixes

- Fixed Vercel serverless function compatibility by setting Node.js 20 engine
- Fixed Vercel configuration for Astro hybrid rendering mode

## v1.0.0 - 2026-01-29

### New Features

- Initialized Claude Codex plugin system with commands, agents, skills, and rules
- Added auto-sync daemon for local file watching
- Added Chrome browser extension for Claude.ai sync
- Added bookmarklet tools for quick sync
- Added release and GitHub Actions setup commands
- Added secrets-audit and env-example skills
- Added jbdocs documentation workflow with mandatory changelog updates

### Bug Fixes

- Fixed security issue with hardcoded secrets in settings

### Security

- Removed hardcoded secrets from settings.local.json
