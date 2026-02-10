# Changelog

All notable changes to Claude Codex are documented here.

## Unreleased - 2026-02-09

### New Features

- Added a plugin install command bar that generates copy-paste commands for installing and removing plugins directly from the catalog
- Added app detail pages with automatic syncing of plugin components from GitHub repositories
- Added cross-references between plugins, an explore mode for discovering related items, and a My Repos tab
- Added new session management commands: save-to-notion, changelog, and changelog settings
- Added component detail modals showing full source markdown for each plugin item
- Added a complete plugin catalog with 146 plugins, including install tracking and active/inactive toggling
- Added integration with the JB Cloud App Tracker for managing deployed applications
- Added a collapsible sidebar with tabbed palette chips and double-click quick-add for faster navigation
- Added a visual command composer for building complex workflows from components
- Added an interactive dependency graph for visualizing relationships between plugins
- Added toast notifications to replace browser alert dialogs for a smoother experience
- Added live interactive component previews with adjustable card sizes in the marketplace
- Added component previews and documentation links to marketplace cards
- Added a full marketplace page to the dashboard
- Added dashboard view toggle and marketplace browsing API
- Added an admin dashboard with data generation, API routes, and full CRUD management

### Bug Fixes

- Fixed plugin detail pages returning a 500 error due to an SSR import issue
- Fixed plugin cards navigating to a dead page instead of toggling selection
- Fixed sync to check both nested and root-level item directories
- Fixed database initialization to use lazy loading with automatic schema migration
- Fixed sticky sidebar, dark scrollbar styling, pagination controls, and resizable composer panels
- Fixed 3 pre-existing build failures that were blocking deployment
- Fixed Vercel serverless function compatibility by setting Node.js 20 engine
- Fixed Vercel configuration for Astro hybrid rendering mode
