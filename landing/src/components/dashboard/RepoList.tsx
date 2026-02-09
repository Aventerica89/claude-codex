import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { MY_REPOS, REPO_CATEGORIES, type RepoCategory, type UserRepo } from '@/lib/repos'

interface RepoState {
  active: boolean
}

export function RepoList() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<RepoCategory | 'all'>('all')
  const [repoStates, setRepoStates] = useState<Record<string, RepoState>>({})
  const [loading, setLoading] = useState(true)

  // Fetch active repo states on mount
  useEffect(() => {
    fetchRepoStates()
  }, [])

  const fetchRepoStates = async () => {
    try {
      const response = await fetch('/api/repos')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      if (data.success) {
        const states: Record<string, RepoState> = {}
        for (const repo of data.data) {
          states[repo.repo_name] = { active: Boolean(repo.active) }
        }
        setRepoStates(states)
      }
    } catch {
      // Silently fail — default to all inactive
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (repo: UserRepo) => {
    const current = repoStates[repo.name]?.active ?? false
    const newActive = !current

    // Optimistic update
    setRepoStates((prev) => ({
      ...prev,
      [repo.name]: { active: newActive },
    }))

    try {
      const response = await fetch('/api/repos/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: repo.name,
          owner: repo.owner,
          active: newActive,
        }),
      })
      if (!response.ok) throw new Error('Toggle failed')
    } catch {
      // Revert on failure
      setRepoStates((prev) => ({
        ...prev,
        [repo.name]: { active: current },
      }))
    }
  }

  const filteredRepos = useMemo(() => {
    return MY_REPOS.filter((repo) => {
      const matchesCategory = categoryFilter === 'all' || repo.category === categoryFilter
      if (!matchesCategory) return false
      if (!search) return true

      const q = search.toLowerCase()
      return (
        repo.name.toLowerCase().includes(q) ||
        repo.description.toLowerCase().includes(q) ||
        repo.owner.toLowerCase().includes(q)
      )
    })
  }, [search, categoryFilter])

  const activeCount = Object.values(repoStates).filter((s) => s.active).length

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search repos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg',
            'bg-background border border-border',
            'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
            'placeholder:text-muted-foreground'
          )}
        />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {activeCount} active
        </span>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategoryFilter('all')}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium transition-colors',
            categoryFilter === 'all'
              ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
              : 'bg-foreground/5 text-muted-foreground hover:text-foreground border border-transparent'
          )}
        >
          All ({MY_REPOS.length})
        </button>
        {REPO_CATEGORIES.map((cat) => {
          const count = MY_REPOS.filter((r) => r.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                categoryFilter === cat
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : 'bg-foreground/5 text-muted-foreground hover:text-foreground border border-transparent'
              )}
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      {/* Repo list */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-1">
          {filteredRepos.map((repo) => {
            const isActive = repoStates[repo.name]?.active ?? false
            return (
              <div
                key={repo.name}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg',
                  'border border-border/50 hover:border-border',
                  'transition-colors group',
                  isActive && 'border-violet-500/30 bg-violet-500/5'
                )}
              >
                {/* Toggle switch */}
                <button
                  onClick={() => handleToggle(repo)}
                  className={cn(
                    'relative w-8 h-4 rounded-full transition-colors shrink-0',
                    isActive ? 'bg-violet-500' : 'bg-foreground/20'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white',
                      'transition-transform',
                      isActive && 'translate-x-4'
                    )}
                  />
                </button>

                {/* Repo info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {repo.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {repo.owner}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {repo.description}
                  </p>
                </div>

                {/* Category badge */}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground shrink-0 hidden md:inline">
                  {repo.category}
                </span>
              </div>
            )
          })}

          {filteredRepos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No repos match your search
            </div>
          )}
        </div>
      )}
    </div>
  )
}
