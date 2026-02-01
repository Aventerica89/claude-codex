# TDD Setup for Astro/Starlight Projects

**Extracted:** 2026-01-31
**Context:** Setting up test-driven development in documentation sites using Astro/Starlight

## Problem
Astro/Starlight projects often have logic in scripts (badge expiration, frontmatter manipulation, sidebar validation) that's hard to test because it's embedded in CLI scripts. This makes it difficult to ensure correctness and prevents regression testing.

## Solution

### 1. Install Vitest
```bash
npm install -D vitest
```

### 2. Create vitest.config.mjs
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

### 3. Add test scripts to package.json
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

### 4. Extract logic to testable modules
Move logic from scripts (e.g., `scripts/expire-badges.mjs`) to `src/lib/module-name.mjs`:
- Export pure functions
- Import in both tests AND original scripts
- Keep I/O (file reading/writing) in the script, logic in the module

Example refactor:
```javascript
// BEFORE: scripts/expire-badges.mjs
function hasExpiredBadge(content) {
  // inline logic
}

// AFTER: src/lib/new-badge.mjs
export function hasExpiredBadge(content) {
  // testable logic
}

// scripts/expire-badges.mjs
import { hasExpiredBadge } from '../src/lib/new-badge.mjs';
```

### 5. Write tests first (TDD RED-GREEN-REFACTOR)
```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { myFunction } from './module.mjs';

describe('Feature', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-30'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should do something', () => {
    expect(myFunction(input)).toBe(expected);
  });
});
```

## Example: Frontmatter Testing Pattern
```javascript
// Testing frontmatter parsing
it('should parse valid frontmatter', () => {
  const content = `---
title: Test
isNew: true
---
Content`;

  const result = parseFrontmatter(content);
  expect(result.frontmatter).toContain('isNew: true');
  expect(result.body).toContain('Content');
});

// Testing date-based expiration with fake timers
it('should detect expired badges', () => {
  vi.setSystemTime(new Date('2026-01-30'));

  const content = `---
newUntil: "2026-01-15"
---`;

  expect(hasExpiredBadge(content)).toBe(true);
});
```

## Key Patterns

### Frontmatter Manipulation
```javascript
export function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { frontmatter: null, body: content };

  return {
    frontmatter: match[1],
    body: content.slice(match[0].length),
  };
}
```

### Date-Based Logic with Fake Timers
```javascript
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-30'));
});

afterEach(() => {
  vi.useRealTimers();
});

it('should handle date comparisons', () => {
  const result = isExpired('2026-01-15');
  expect(result).toBe(true);
});
```

### Testing Regex-Based Modifications
```javascript
it('should remove specific fields from frontmatter', () => {
  const content = `---
title: Test
isNew: true
newUntil: "2026-01-15"
---`;

  const result = removeBadgeFromContent(content);
  expect(result).not.toContain('isNew');
  expect(result).not.toContain('newUntil');
  expect(result).toContain('title: Test');
});
```

## When to Use
- Adding testable logic to documentation sites
- Refactoring existing scripts into testable modules
- Any frontmatter manipulation logic (badge systems, metadata)
- Date-based expiration systems
- Sidebar/navigation validation logic
- Content processing pipelines in Astro/Starlight

## Benefits
- **Confidence**: Tests ensure logic works as expected
- **Regression prevention**: Catch breaking changes early
- **Documentation**: Tests serve as usage examples
- **Refactoring safety**: Safely modify code with test coverage
- **TDD workflow**: Write tests first, implement to make them pass

## Typical Test Suite Structure
```
src/lib/
  ├── feature.mjs          # Pure logic functions
  └── feature.test.mjs     # Test suite

scripts/
  └── feature-script.mjs   # Uses lib/feature.mjs for I/O operations
```

## Coverage Goals
- Aim for 80%+ test coverage
- Focus on edge cases (empty input, null values, date boundaries)
- Test both happy path and error cases
- Use descriptive test names that explain behavior
