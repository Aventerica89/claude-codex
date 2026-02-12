# Mobile Optimization Quick Start Guide

**TL;DR:** Copy-paste code snippets to quickly improve mobile UX while maintaining VaporForge's design system.

---

## 30-Minute Quick Wins

### 1. Fix Touch Targets (10 min)

**File:** `/workspace/landing/src/components/ui/button.tsx`

```tsx
// Replace size variants (lines 18-24)
size: {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3 text-xs',        // Was h-8
  lg: 'h-11 rounded-md px-8',               // Was h-10
  xl: 'h-12 rounded-lg px-10 text-base',
  icon: 'h-11 w-11',                        // Was h-9 w-9
  touch: 'h-11 px-4 py-2 text-sm',          // NEW
},
```

### 2. Add Touch Feedback (5 min)

**Search & Replace across all button elements:**

Before:
```tsx
<button className="px-3 py-1.5 ...">
```

After:
```tsx
<button className="px-3 py-2.5 sm:py-1.5 active:scale-95 transform transition-transform ...">
```

### 3. Responsive Padding (5 min)

**Search & Replace pattern:**

```tsx
// Cards
className="p-4"  →  className="p-3 sm:p-4"
className="p-5"  →  className="p-4 sm:p-5"
className="p-6"  →  className="p-4 sm:p-6"

// Sections
className="py-24"  →  className="py-12 sm:py-16 lg:py-24"

// Container
className="px-4"  →  className="px-3 sm:px-4"
```

### 4. Update Input Heights (10 min)

**File:** `/workspace/landing/src/components/dashboard/ItemGrid.tsx` (and similar)

```tsx
// Line 90-96
<input
  type="search"
  inputMode="search"  // ADD THIS
  className="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-base sm:text-sm"
  // Changed: py-2 → py-3, added text-base sm:text-sm
/>
```

---

## 1-Hour Priority Fixes

### 5. Mobile Bottom Navigation (30 min)

**Create:** `/workspace/landing/src/components/dashboard/BottomNav.tsx`

```tsx
"use client"

import { cn } from '@/lib/utils'

interface BottomNavProps {
  currentPath: string
}

const primaryNavItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    href: '/dashboard',
  },
  {
    id: 'commands',
    label: 'Commands',
    icon: 'M4 17l6-6-6-6M12 19h8',
    href: '/dashboard/commands',
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: 'M12 2a4 4 0 014 4v2a4 4 0 01-8 0V6a4 4 0 014-4zM6 10a6 6 0 0012 0',
    href: '/dashboard/agents',
  },
  {
    id: 'apps',
    label: 'Apps',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    href: '/dashboard/apps',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
    href: '/dashboard/settings',
  },
]

export function BottomNav({ currentPath }: BottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-padding-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {primaryNavItems.map((item) => {
          const isActive = currentPath === item.href ||
            (item.href !== '/dashboard' && currentPath.startsWith(item.href))

          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5',
                'min-h-[44px] min-w-[44px] rounded-lg transition-colors',
                'active:scale-95 transform',
                isActive
                  ? 'text-violet-400'
                  : 'text-muted-foreground active:bg-secondary/50'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
```

### 6. Update DashboardLayout (10 min)

**File:** `/workspace/landing/src/components/dashboard/DashboardLayout.tsx`

```tsx
// Add import
import { BottomNav } from './BottomNav'

// Replace the main layout div (lines 119-131)
return (
  <ToastProvider>
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Hide sidebar on mobile */}
      <div className="hidden lg:block">
        <Sidebar currentPath={currentPath} />
      </div>

      {/* Main content with bottom padding for mobile nav */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="p-3 sm:p-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav currentPath={currentPath} />
    </div>
  </ToastProvider>
)
```

### 7. Hide Sidebar on Mobile (5 min)

**File:** `/workspace/landing/src/components/dashboard/Sidebar.tsx`

```tsx
// Update the aside element (line 125)
<aside
  className={cn(
    'h-screen bg-card border-r border-border flex flex-col transition-all duration-200',
    'hidden lg:flex',  // ADD THIS LINE
    collapsed ? 'w-14' : 'w-64'
  )}
>
```

### 8. ConnectionStrip Mobile Stacking (15 min)

**File:** `/workspace/landing/src/components/dashboard/ConnectionStrip.tsx`

```tsx
// Replace header (lines 145-166)
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
  <h3 className="text-sm font-semibold">Connection Status</h3>
  <div className="flex items-center gap-3 text-xs">
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-green-500" />
      <span className="hidden xs:inline">Connected: </span>
      {connectedCount}
    </span>
    {/* ... rest of stats ... */}
  </div>
</div>

// Replace grouped rows section (lines 169-200)
<div className="space-y-3 sm:space-y-1">
  {TYPE_ORDER.map(type => {
    const group = grouped[type]
    if (group.length === 0) return null

    return (
      <div key={type}>
        {/* Mobile: Full-width stack */}
        <div className="sm:hidden">
          <div className="text-[11px] text-muted-foreground font-medium mb-1.5">
            {TYPE_LABELS[type]}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {group.map(service => (
              <ServiceChip
                key={service.id}
                service={service}
                isSelected={selectedId === service.id}
                onSelect={() =>
                  setSelectedId(selectedId === service.id ? null : service.id)
                }
              />
            ))}
          </div>
        </div>

        {/* Desktop: Horizontal layout */}
        <div className="hidden sm:flex items-center gap-1">
          <span className="text-[11px] text-muted-foreground w-20 shrink-0 text-right pr-3">
            {TYPE_LABELS[type]}
          </span>
          <div className="w-px h-5 bg-border shrink-0" />
          <div className="flex items-center gap-1 flex-wrap pl-2">
            {group.map(service => (
              <ServiceChip
                key={service.id}
                service={service}
                isSelected={selectedId === service.id}
                onSelect={() =>
                  setSelectedId(selectedId === service.id ? null : service.id)
                }
              />
            ))}
          </div>
        </div>
      </div>
    )
  })}
</div>

// Update ServiceChip button (line 45-72)
<button
  onClick={onSelect}
  aria-label={`${service.name} - ${getStatusLabel(service.status)}`}
  className={cn(
    'flex items-center gap-2 rounded-lg text-xs transition-all',
    'px-3 py-2.5 sm:py-1.5',  // Taller on mobile
    'active:scale-95 transform',  // Touch feedback
    'border border-transparent',
    isSelected
      ? 'bg-secondary border-border shadow-sm'
      : 'hover:bg-secondary/40 active:bg-secondary/60'
  )}
>
```

---

## Accessibility Quick Fixes (15 min)

### 9. Add Skip Navigation

**File:** `/workspace/landing/src/components/dashboard/DashboardLayout.tsx`

```tsx
// Add before the main flex container
return (
  <ToastProvider>
    {/* Skip navigation */}
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-3 focus:bg-violet-600 focus:text-white focus:rounded-lg focus:ring-2 focus:ring-white"
    >
      Skip to main content
    </a>

    <div className="h-screen bg-background flex overflow-hidden">
      {/* ... rest of layout ... */}
      <main id="main-content" className="flex-1 overflow-y-auto pb-20 lg:pb-0">
```

### 10. Add ARIA Labels to Icon Buttons

**File:** `/workspace/landing/src/components/dashboard/Sidebar.tsx`

```tsx
// Line 147-168
<button
  onClick={toggle}
  className="..."
  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  aria-expanded={!collapsed}
>
```

**File:** `/workspace/landing/src/components/Header.tsx`

```tsx
// Line 56-67
<button
  className="md:hidden p-2"
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
  aria-expanded={mobileMenuOpen}
>
```

---

## CSS Utilities (5 min)

**File:** `/workspace/landing/src/styles/globals.css`

Add at the end:

```css
@layer utilities {
  /* Touch target utilities */
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }

  .touch-feedback {
    @apply active:scale-95 transform transition-transform;
  }

  /* Safe area insets for iOS */
  .safe-padding-top {
    padding-top: env(safe-area-inset-top);
  }

  .safe-padding-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .safe-padding-left {
    padding-left: env(safe-area-inset-left);
  }

  .safe-padding-right {
    padding-right: env(safe-area-inset-right);
  }
}
```

---

## Tailwind Config (5 min)

**File:** `/workspace/landing/tailwind.config.mjs`

```javascript
export default {
  theme: {
    extend: {
      // ... existing config ...

      // ADD THESE:
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      height: {
        'touch': '44px',
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      screens: {
        'xs': '475px', // Add extra small breakpoint
      },
    },
  },
}
```

---

## Testing Checklist

After implementing changes, test on:

### Mobile Devices (Real or DevTools)
- [ ] iPhone SE (375px) - Smallest modern iOS
- [ ] iPhone 14 Pro (393px) - Current iOS
- [ ] Samsung Galaxy S21 (360px) - Common Android
- [ ] iPad (768px) - Tablet portrait

### Functionality Tests
- [ ] All buttons are tappable without zoom
- [ ] No horizontal scrolling on any page
- [ ] Bottom navigation works correctly
- [ ] ConnectionStrip stacks properly on mobile
- [ ] Modals fit on screen without scrolling header/footer
- [ ] Form inputs trigger correct mobile keyboard
- [ ] Skip navigation link works with Tab key

### Accessibility Tests
- [ ] All interactive elements have 44px+ touch targets
- [ ] Focus indicators are visible
- [ ] ARIA labels present on icon buttons
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes

### Performance Tests
- [ ] Lighthouse Mobile score > 90
- [ ] No layout shift (CLS < 0.1)
- [ ] Fast paint times (FCP < 1.8s, LCP < 2.5s)

---

## Quick Visual Test

Run this in your browser console to highlight elements with small touch targets:

```javascript
// Highlight touch targets < 44px
document.querySelectorAll('button, a, input, [role="button"]').forEach(el => {
  const rect = el.getBoundingClientRect()
  if (rect.width < 44 || rect.height < 44) {
    el.style.outline = '3px solid red'
    console.log('Small target:', el, `${rect.width}x${rect.height}`)
  }
})
```

---

## Common Patterns Reference

### Button Sizes
```tsx
<Button size="touch">Mobile Optimized</Button>
<Button size="icon" aria-label="Settings">
  <svg>...</svg>
</Button>
```

### Input Heights
```tsx
<input
  type="search"
  inputMode="search"
  className="h-12 px-4 text-base sm:text-sm"
/>
```

### Responsive Grids
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
```

### Responsive Padding
```tsx
<div className="p-3 sm:p-4 lg:p-5">
<section className="py-12 sm:py-16 lg:py-24">
```

### Touch Feedback
```tsx
<button className="active:scale-95 transform transition-transform">
```

---

## Commit Messages

```bash
# Quick wins
git commit -m "fix: increase button touch targets to 44px minimum"
git commit -m "feat: add touch feedback to all interactive elements"
git commit -m "fix: responsive padding for mobile devices"

# Navigation
git commit -m "feat: add mobile bottom navigation"
git commit -m "fix: hide sidebar on mobile viewports"

# ConnectionStrip
git commit -m "fix: stack ConnectionStrip groups on mobile"

# Accessibility
git commit -m "a11y: add ARIA labels to icon buttons"
git commit -m "a11y: add skip navigation link"

# Config
git commit -m "chore: add mobile utilities to tailwind config"
```

---

## Need Help?

**Quick debugging:**
1. Check Chrome DevTools > Device Mode (iPhone SE / Galaxy S21)
2. Toggle "Show media queries" in DevTools
3. Use Lighthouse > Mobile audit
4. Test with real device if possible

**Common issues:**
- **Touch targets still small?** Make sure parent has no `max-h` constraint
- **Bottom nav not showing?** Check z-index conflicts
- **Grid overflowing?** Add `min-w-0` to grid items
- **Text too small?** Use `text-base` on mobile, `sm:text-sm` on desktop

**Design system colors:**
- Primary violet: `bg-violet-600` / `text-violet-400`
- Secondary: `bg-secondary` / `text-secondary-foreground`
- Borders: `border-border`
- Card background: `bg-card`

---

**Total implementation time:** ~2 hours for all quick fixes
**Impact:** Significantly improved mobile UX, better accessibility, WCAG 2.1 AA compliance

**Next:** See `/workspace/MOBILE_OPTIMIZATION_ANALYSIS.md` for comprehensive analysis and advanced optimizations.
