# More Drawer / Bottom Sheet Pattern

Cross-project mobile navigation overflow pattern. Use when bottom tab bar exceeds 4 primary items.

## When to Use

- Mobile tab bar has more than 4 navigation destinations
- 5th tab becomes "More" — opens a bottom sheet with the overflow items
- iPad/Desktop: sidebar shows all items, More drawer not needed

## Dependencies

- **shadcn/ui Sheet** (`@radix-ui/react-dialog`) — `npx shadcn@latest add sheet`
- **Lucide icons** — `MoreHorizontal` for the trigger

## Architecture

```
primaryTabs[]   → rendered in bottom nav (max 4)
moreItems[]     → rendered in Sheet grid
isMoreActive()  → lights up More tab when any overflow route is active
```

## Spec

| Property | Value | Note |
|----------|-------|------|
| Component | shadcn Sheet (Radix Dialog) | `side="bottom"` |
| Border radius | `rounded-t-xl` | Top corners only (12px) |
| Overlay | `bg-black/50` | Semi-transparent backdrop |
| Grid layout | `grid grid-cols-3 gap-2` | 3 columns, 8px gap |
| Grid item padding | `p-3` | 12px all sides (meets 44px target) |
| Grid item icon | `h-6 w-6` | 24px Lucide icons |
| Grid item label | `text-xs` | 12px, below icon |
| Active state | `bg-{brand}/10 text-{brand}` | Project-specific brand color |
| Hover state | `hover:bg-muted hover:text-foreground` | Subtle background lift |
| Safe area | `pb-[env(safe-area-inset-bottom)]` | On nav container |
| Close | `onClick={() => setOpen(false)}` | Each link closes sheet |
| Tab bar height | `min-h-[52px]` | 52px meets 44px HIG minimum |
| Tab label size | `text-[0.6875rem]` | 11px — HIG minimum |

## HIG Compliance

- Max 4 primary tabs (HIG tab bar rule)
- All touch targets >= 44px (tab items, grid items)
- More button inherits active state from overflow routes
- `-webkit-tap-highlight-color: transparent` on interactive elements
- Safe area inset on nav container
- `overscroll-behavior: none` on body
- iPad+ (768px/1024px): sidebar shows all items, bottom nav hidden

## Code Template

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";

// Max 4 items in bottom bar
const primaryTabs = [
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/routines", label: "Routines", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Overflow items go in More sheet
const moreItems = [
  { href: "/life-context", label: "Life Context", icon: MapPin },
  { href: "/profile", label: "Profile", icon: User },
];

function isMoreActive(pathname: string) {
  return moreItems.some(
    (item) => pathname === item.href
           || pathname.startsWith(item.href + "/")
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const moreActive = isMoreActive(pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t
      border-border bg-background
      pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around">
        {primaryTabs.map((tab) => {
          const isActive = pathname === tab.href
            || pathname.startsWith(tab.href + "/");
          return (
            <Link key={tab.href} href={tab.href}
              className={cn(
                "relative flex min-h-[52px] flex-1 flex-col",
                "items-center justify-center gap-0.5",
                "text-[0.6875rem] font-medium transition-colors",
                isActive
                  ? "text-{brand}"
                  : "text-muted-foreground hover:text-foreground",
              )}>
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute top-0 h-0.5 w-10
                  rounded-full bg-{brand}" />
              )}
            </Link>
          );
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className={cn(
              "relative flex min-h-[52px] flex-1 flex-col",
              "items-center justify-center gap-0.5",
              "text-[0.6875rem] font-medium transition-colors",
              moreActive
                ? "text-{brand}"
                : "text-muted-foreground hover:text-foreground",
            )}>
              <MoreHorizontal className="h-5 w-5" />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-xl">
            <SheetHeader>
              <SheetTitle>More</SheetTitle>
            </SheetHeader>
            <nav className="mt-2 grid grid-cols-3 gap-2 pb-4">
              {moreItems.map((item) => {
                const isActive = pathname === item.href
                  || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1.5",
                      "rounded-lg p-3 text-sm font-medium",
                      "transition-colors",
                      isActive
                        ? "bg-{brand}/10 text-{brand}"
                        : "text-muted-foreground hover:bg-muted",
                    )}>
                    <item.icon className="h-6 w-6" />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
```

Replace `{brand}` with your project's accent color:
- **Clarity:** `clarity-amber`
- **WP Dispatch:** `primary`
- **DevTools:** `primary`

## Proven In

- **WP Dispatch** (`~/wp-dispatch/src/components/bottom-nav.tsx`) — 8 overflow items
- **Clarity** (planned) — 2 overflow items (Life Context, Profile)

## Visual Reference

See `~/clarity/clarity-design-system.html` Section 11 — More Drawer for interactive mockups.
