# Project: RepoBar

## Context
- Type: macOS menu bar utility app
- Stack: SwiftUI, Swift Package Manager, MenuBarExtra (macOS 13+)
- Status: Initial implementation complete
- Location: `/Users/jb/RepoBar/`
- Repository: https://github.com/Aventerica89/RepoBar

## Key Decisions

**MenuBarExtra over NSStatusItem**
- Rationale: Modern SwiftUI API, better integration, allows window style for richer UI

**`gh` CLI over GitHub API**
- Rationale: User already authenticated, no OAuth flow needed, simpler implementation

**Actor-based services over @MainActor**
- Rationale: ShellExecutor, GitHubService, LocalRepoScanner, GitStatusChecker all use actors for safe concurrent access

**No SwiftData for persistence**
- Rationale: In-memory state with on-demand refresh, repos fetched quickly from sources

**Process/shell execution pattern**
- Rationale: Native Swift Process for git/gh commands, async/await wrapper for clean API

## Progress
- [x] Project structure created
- [x] Models: Repository, GitStatus, CIStatus
- [x] Services: ShellExecutor, GitHubService, LocalRepoScanner, GitStatusChecker
- [x] Views: RepoMenuContent, RepoRow, SettingsView, RepoViewModel
- [x] App entry point with MenuBarExtra
- [x] Build and test
- [x] Git repository initialized and pushed
- [ ] User testing and feedback
- [ ] Refinement based on usage

## Architecture Patterns

### Async Shell Execution
```swift
actor ShellExecutor {
    func run(_ command: String, at directory: URL? = nil) async throws -> String {
        // Process with async/await wrapper
        // Adds /opt/homebrew/bin to PATH automatically
    }
}
```

### Main Actor ViewModel with TaskGroup
```swift
@MainActor
class RepoViewModel: ObservableObject {
    func refresh() async {
        // Parallel fetching with async let
        async let githubRepos = gitHub.fetchRepos()
        async let localRepos = scanner.scanDirectories(directories)

        // Parallel status checking with TaskGroup
        await withTaskGroup(of: (UUID, GitStatus, CIStatus).self) { group in
            // Add tasks to group
        }
    }

    // Mark pure functions as nonisolated to call from TaskGroup
    private nonisolated func extractRepoName(from url: URL) -> String? {
        // Safe to call off main actor
    }
}
```

### Menu Bar UI Pattern
```swift
@main
struct RepoBarApp: App {
    var body: some Scene {
        MenuBarExtra("RepoBar", systemImage: "arrow.triangle.branch") {
            RepoMenuContent()
        }
        .menuBarExtraStyle(.window)  // Allows scroll, buttons, richer UI
    }
}
```

## Next Session
- Start with: User testing - run the app and gather feedback
- Potential improvements:
  - Add keyboard shortcuts for common actions
  - Cache repo data with background refresh
  - Add repo grouping/filtering options
  - Add git operations (pull, fetch, stash)
  - Add notifications for CI status changes

## Learned Patterns

**Swift Concurrency with MainActor**
- Use `nonisolated` for pure functions that need to be called from TaskGroup
- `@MainActor` class with `@Published` properties for SwiftUI state
- Actor services for background operations

**Menu Bar App Setup**
- MenuBarExtra with .window style for rich UI
- No dock icon, menu bar only (LSUIElement in Info.plist if needed)
- Search + refresh + settings pattern for menu content

**Git Integration**
- Shell commands via Process wrapped in async/await
- Parse porcelain formats for programmatic access
- Convert SSH URLs to HTTPS for browser opening

## Reusable Components

1. **ShellExecutor** - Generic async shell command runner
2. **Menu bar UI pattern** - Search, grouped sections, settings footer
3. **Status indicator pattern** - Symbol + color + tooltip
4. **Git status parsing** - Porcelain format parsing for clean/dirty/ahead/behind
