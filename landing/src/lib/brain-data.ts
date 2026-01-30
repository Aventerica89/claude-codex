export type BrainItemType = 'command' | 'agent' | 'skill' | 'rule';

export interface BrainItem {
  id: string;
  name: string;
  type: BrainItemType;
  description: string;
  category?: string;
  usage?: string;
  tags: string[];
}

export const brainData: BrainItem[] = [
  // Commands
  { id: 'cmd-new-project', name: '/new-project', type: 'command', description: 'Comprehensive project initialization with 7 phases', category: 'Project', usage: '/new-project', tags: ['init', 'setup', 'project'] },
  { id: 'cmd-commit', name: '/commit', type: 'command', description: 'Smart git commit with conventional commit format', category: 'Git', usage: '/commit', tags: ['git', 'version-control'] },
  { id: 'cmd-code-review', name: '/code-review', type: 'command', description: 'Comprehensive code review for quality and security', category: 'Quality', usage: '/code-review [file]', tags: ['review', 'quality', 'security'] },
  { id: 'cmd-security', name: '/security', type: 'command', description: 'Security vulnerability analysis', category: 'Quality', usage: '/security', tags: ['security', 'owasp', 'audit'] },
  { id: 'cmd-tdd', name: '/tdd', type: 'command', description: 'Test-driven development workflow', category: 'Testing', usage: '/tdd', tags: ['testing', 'tdd', 'coverage'] },
  { id: 'cmd-build-fix', name: '/build-fix', type: 'command', description: 'Fix build and type errors automatically', category: 'Build', usage: '/build-fix', tags: ['build', 'typescript', 'errors'] },
  { id: 'cmd-deploy-check', name: '/deploy-check', type: 'command', description: 'Pre-deployment verification checklist', category: 'Deploy', usage: '/deploy-check', tags: ['deploy', 'ci', 'verification'] },
  { id: 'cmd-deploy-env', name: '/deploy-env', type: 'command', description: 'Deploy environment variables to platforms', category: 'Deploy', usage: '/deploy-env [platform]', tags: ['env', 'vercel', 'cloudflare'] },
  { id: 'cmd-test-coverage', name: '/test-coverage', type: 'command', description: 'Run tests with coverage report', category: 'Testing', usage: '/test-coverage', tags: ['testing', 'coverage', 'jest'] },
  { id: 'cmd-e2e', name: '/e2e', type: 'command', description: 'Run end-to-end tests with Playwright', category: 'Testing', usage: '/e2e', tags: ['e2e', 'playwright', 'testing'] },
  { id: 'cmd-env-example', name: '/env-example', type: 'command', description: 'Generate .env.example from current env', category: 'Config', usage: '/env-example', tags: ['env', 'config', 'setup'] },
  { id: 'cmd-deps-audit', name: '/deps-audit', type: 'command', description: 'Audit dependencies for vulnerabilities', category: 'Security', usage: '/deps-audit', tags: ['npm', 'audit', 'security'] },
  { id: 'cmd-update-docs', name: '/update-docs', type: 'command', description: 'Update project documentation', category: 'Docs', usage: '/update-docs', tags: ['docs', 'readme', 'documentation'] },
  { id: 'cmd-context-save', name: '/context-save', type: 'command', description: 'Save current session context', category: 'Context', usage: '/context-save [name]', tags: ['context', 'session', 'memory'] },
  { id: 'cmd-context-restore', name: '/context-restore', type: 'command', description: 'Restore saved session context', category: 'Context', usage: '/context-restore [name]', tags: ['context', 'session', 'memory'] },
  { id: 'cmd-checkpoint', name: '/checkpoint', type: 'command', description: 'Create development checkpoint', category: 'Context', usage: '/checkpoint', tags: ['checkpoint', 'save', 'progress'] },
  { id: 'cmd-learn', name: '/learn', type: 'command', description: 'Extract patterns from current session', category: 'Learning', usage: '/learn', tags: ['learning', 'patterns', 'skills'] },
  { id: 'cmd-ideas', name: '/ideas', type: 'command', description: 'Log feature ideas and improvements', category: 'Planning', usage: '/ideas', tags: ['ideas', 'backlog', 'features'] },
  { id: 'cmd-standup', name: '/standup', type: 'command', description: 'Generate standup update from git history', category: 'Planning', usage: '/standup', tags: ['standup', 'status', 'report'] },
  { id: 'cmd-remind', name: '/remind', type: 'command', description: 'Set context reminders', category: 'Context', usage: '/remind [message]', tags: ['reminder', 'context', 'notes'] },
  { id: 'cmd-end', name: '/end', type: 'command', description: 'End session with docs sync', category: 'Session', usage: '/end', tags: ['session', 'end', 'sync'] },
  { id: 'cmd-setup-github-actions', name: '/setup-github-actions', type: 'command', description: 'Configure GitHub Actions CI/CD', category: 'CI/CD', usage: '/setup-github-actions', tags: ['github', 'actions', 'ci'] },
  { id: 'cmd-create-release', name: '/create-release', type: 'command', description: 'Create a new release with changelog', category: 'Release', usage: '/create-release [version]', tags: ['release', 'changelog', 'version'] },

  // Agents
  { id: 'agent-planner', name: 'planner', type: 'agent', description: 'Feature implementation planning with detailed step breakdown', category: 'Planning', tags: ['planning', 'architecture', 'design'] },
  { id: 'agent-tdd-guide', name: 'tdd-guide', type: 'agent', description: 'Test-driven development specialist enforcing 80%+ coverage', category: 'Testing', tags: ['tdd', 'testing', 'coverage'] },
  { id: 'agent-security-reviewer', name: 'security-reviewer', type: 'agent', description: 'OWASP Top 10 vulnerability detection and security analysis', category: 'Security', tags: ['security', 'owasp', 'audit'] },
  { id: 'agent-code-reviewer', name: 'code-reviewer', type: 'agent', description: 'Code quality, architecture, and best practices analysis', category: 'Quality', tags: ['review', 'quality', 'patterns'] },
  { id: 'agent-architect', name: 'architect', type: 'agent', description: 'System design and architecture planning', category: 'Architecture', tags: ['architecture', 'design', 'system'] },
  { id: 'agent-build-error-resolver', name: 'build-error-resolver', type: 'agent', description: 'Build and type error debugging specialist', category: 'Build', tags: ['build', 'errors', 'typescript'] },
  { id: 'agent-e2e-runner', name: 'e2e-runner', type: 'agent', description: 'Playwright E2E testing automation', category: 'Testing', tags: ['e2e', 'playwright', 'automation'] },
  { id: 'agent-refactor-cleaner', name: 'refactor-cleaner', type: 'agent', description: 'Dead code removal and cleanup', category: 'Quality', tags: ['refactor', 'cleanup', 'dead-code'] },
  { id: 'agent-doc-updater', name: 'doc-updater', type: 'agent', description: 'Documentation generation and updates', category: 'Docs', tags: ['docs', 'readme', 'documentation'] },
  { id: 'agent-env-deployer', name: 'env-deployer', type: 'agent', description: 'Environment variable deployment automation', category: 'Deploy', tags: ['env', 'deploy', 'automation'] },
  { id: 'agent-bricks-builder', name: 'bricks-builder', type: 'agent', description: 'Specialized builder for Bricks framework', category: 'Framework', tags: ['bricks', 'builder', 'wordpress'] },
  { id: 'agent-jbdocs', name: 'jbdocs', type: 'agent', description: 'Documentation workflow automation', category: 'Docs', tags: ['docs', 'workflow', 'automation'] },

  // Skills
  { id: 'skill-coding-standards', name: 'coding-standards', type: 'skill', description: 'TypeScript/JavaScript best practices and patterns', category: 'Standards', tags: ['typescript', 'javascript', 'patterns'] },
  { id: 'skill-frontend-patterns', name: 'frontend-patterns', type: 'skill', description: 'React, Next.js, Vue patterns and best practices', category: 'Frontend', tags: ['react', 'nextjs', 'vue'] },
  { id: 'skill-backend-patterns', name: 'backend-patterns', type: 'skill', description: 'API design, database optimization patterns', category: 'Backend', tags: ['api', 'database', 'optimization'] },
  { id: 'skill-security-review', name: 'security-review', type: 'skill', description: 'Security checklists and vulnerability patterns', category: 'Security', tags: ['security', 'checklist', 'owasp'] },
  { id: 'skill-tdd-workflow', name: 'tdd-workflow', type: 'skill', description: 'Test-driven development patterns and workflow', category: 'Testing', tags: ['tdd', 'testing', 'workflow'] },
  { id: 'skill-continuous-learning', name: 'continuous-learning', type: 'skill', description: 'Auto-extract patterns from development sessions', category: 'Learning', tags: ['learning', 'patterns', 'extraction'] },
  { id: 'skill-eval-harness', name: 'eval-harness', type: 'skill', description: 'Evaluation and testing harness patterns', category: 'Testing', tags: ['eval', 'testing', 'harness'] },
  { id: 'skill-bricks-learn', name: 'bricks-learn', type: 'skill', description: 'Specialized learning for Bricks framework', category: 'Framework', tags: ['bricks', 'learning', 'wordpress'] },
  { id: 'skill-strategic-compact', name: 'strategic-compact', type: 'skill', description: 'Compact strategy patterns for efficient execution', category: 'Strategy', tags: ['strategy', 'compact', 'efficiency'] },
  { id: 'skill-verification-loop', name: 'verification-loop', type: 'skill', description: 'Quality assurance verification patterns', category: 'QA', tags: ['verification', 'qa', 'quality'] },
  { id: 'skill-clickhouse-io', name: 'clickhouse-io', type: 'skill', description: 'ClickHouse analytics database patterns', category: 'Analytics', tags: ['clickhouse', 'analytics', 'database'] },

  // Rules
  { id: 'rule-cli-first', name: 'cli-first', type: 'rule', description: 'Always check available tools before asking user', category: 'Philosophy', tags: ['cli', 'tools', 'automation'] },
  { id: 'rule-coding-style', name: 'coding-style', type: 'rule', description: 'Immutability, file organization (200-400 lines max)', category: 'Style', tags: ['style', 'organization', 'immutable'] },
  { id: 'rule-testing', name: 'testing', type: 'rule', description: 'TDD workflow with 80% coverage requirement', category: 'Testing', tags: ['tdd', 'coverage', 'testing'] },
  { id: 'rule-git-workflow', name: 'git-workflow', type: 'rule', description: 'Conventional commits (feat:, fix:, refactor:, docs:, test:)', category: 'Git', tags: ['git', 'commits', 'conventional'] },
  { id: 'rule-security', name: 'security', type: 'rule', description: 'Security checks and secret management', category: 'Security', tags: ['security', 'secrets', '1password'] },
  { id: 'rule-performance', name: 'performance', type: 'rule', description: 'Model selection and context management', category: 'Performance', tags: ['performance', 'context', 'optimization'] },
  { id: 'rule-agents', name: 'agents', type: 'rule', description: 'Agent orchestration and delegation guidelines', category: 'Agents', tags: ['agents', 'orchestration', 'delegation'] },
  { id: 'rule-patterns', name: 'patterns', type: 'rule', description: 'API response and repository patterns', category: 'Patterns', tags: ['api', 'repository', 'patterns'] },
  { id: 'rule-env-vars', name: 'env-vars', type: 'rule', description: 'Auto-deploy environment variables to platforms', category: 'Config', tags: ['env', 'deploy', 'config'] },
  { id: 'rule-string-length', name: 'string-length', type: 'rule', description: 'Prevent long string errors (500 char inline max)', category: 'Critical', tags: ['strings', 'limits', 'errors'] },
  { id: 'rule-auto-remind', name: 'auto-remind', type: 'rule', description: 'Periodic context reminders during sessions', category: 'Context', tags: ['reminder', 'context', 'periodic'] },
  { id: 'rule-hooks', name: 'hooks', type: 'rule', description: 'Git and Claude Code hooks configuration', category: 'Hooks', tags: ['hooks', 'git', 'automation'] },
];

export const brainCategories = [...new Set(brainData.map((item) => item.category).filter(Boolean))];

export const brainTags = [...new Set(brainData.flatMap((item) => item.tags))];

export function searchBrain(query: string, typeFilter?: BrainItemType[]): BrainItem[] {
  const lowercaseQuery = query.toLowerCase();

  return brainData.filter((item) => {
    const matchesType = !typeFilter?.length || typeFilter.includes(item.type);
    const matchesQuery =
      !query ||
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery) ||
      item.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery));

    return matchesType && matchesQuery;
  });
}
