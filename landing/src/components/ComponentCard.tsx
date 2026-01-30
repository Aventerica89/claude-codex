"use client"

import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface ComponentCardProps {
  component: {
    id: string
    name: string
    description: string
    category: string
    dependencies: string[]
    registrySource: "shadcn" | "radix" | "custom"
    complexity: "simple" | "intermediate" | "advanced"
    bundleSize: string
    docsUrl: string
    registryId?: string
  }
  isSelected: boolean
  onToggle: (id: string) => void
}

const registryColors = {
  shadcn: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  radix: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  custom: "bg-amber-500/10 text-amber-400 border-amber-500/20",
}

const registryBadgeColors: Record<string, string> = {
  shadcn: "bg-foreground text-background",
  magicui: "bg-gradient-to-r from-pink-500 to-violet-500 text-white",
  aceternity: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
  "shadcn-extensions": "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  originui: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
}

const complexityColors = {
  simple: "text-emerald-400",
  intermediate: "text-amber-400",
  advanced: "text-rose-400",
}

const complexityLabels = {
  simple: "Simple",
  intermediate: "Intermediate",
  advanced: "Advanced",
}

const registryDisplayNames: Record<string, string> = {
  magicui: "Magic UI",
  aceternity: "Aceternity",
  "shadcn-extensions": "Extensions",
  originui: "Origin UI",
}

const registrySourceLabels: Record<string, string> = {
  radix: "Radix",
  shadcn: "shadcn",
  custom: "Custom",
}

export function ComponentCard({
  component,
  isSelected,
  onToggle,
}: ComponentCardProps) {
  const registryId = component.registryId || "shadcn"

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggle(component.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onToggle(component.id)
        }
      }}
      className={cn(
        "group relative flex flex-col gap-3 p-4 rounded-lg border transition-all cursor-pointer",
        isSelected
          ? "border-foreground/50 bg-secondary"
          : "border-border bg-card hover:border-foreground/30 hover:bg-secondary/50"
      )}
    >
      {/* Header: Name + Checkbox */}
      <div className="flex items-start justify-between w-full gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground text-sm">
              {component.name}
            </h3>
            <a
              href={component.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`View ${component.name} documentation`}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {component.description}
          </p>
        </div>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(component.id)}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 shrink-0"
        />
      </div>

      {/* Preview placeholder */}
      <div className="w-full h-16 rounded-md bg-muted/50 border border-border/50 flex items-center justify-center overflow-hidden">
        <ComponentPreview componentId={component.id} />
      </div>

      {/* Meta info row */}
      <div className="flex items-center justify-between gap-2 text-[10px]">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Registry badge for non-shadcn */}
          {registryId !== "shadcn" && (
            <span
              className={cn(
                "px-1.5 py-0.5 rounded font-medium",
                registryBadgeColors[registryId] || "bg-muted text-muted-foreground"
              )}
            >
              {registryDisplayNames[registryId] || registryId}
            </span>
          )}

          {/* Registry source */}
          <span
            className={cn(
              "px-1.5 py-0.5 rounded border font-medium",
              registryColors[component.registrySource]
            )}
          >
            {registrySourceLabels[component.registrySource]}
          </span>

          {/* Category */}
          <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
            {component.category}
          </span>
        </div>

        {/* Bundle size */}
        <span className="text-muted-foreground font-mono">
          {component.bundleSize} KB
        </span>
      </div>

      {/* Footer: Complexity + Dependencies */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <svg className={cn("h-3 w-3", complexityColors[component.complexity])} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className={cn("text-[10px] font-medium", complexityColors[component.complexity])}>
            {complexityLabels[component.complexity]}
          </span>
        </div>

        {component.dependencies.length > 0 ? (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span>
              {component.dependencies.length} dep{component.dependencies.length !== 1 ? "s" : ""}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Standalone</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Mini visual previews for components
function ComponentPreview({ componentId }: { componentId: string }) {
  const baseId = componentId.replace(/^(magic|aceternity|ext|origin)-/, "")

  const previews: Record<string, React.ReactNode> = {
    button: (
      <div className="flex gap-2">
        <div className="px-3 py-1.5 bg-foreground text-background rounded text-[10px] font-medium">Button</div>
        <div className="px-3 py-1.5 border border-border rounded text-[10px] font-medium text-foreground">Outline</div>
      </div>
    ),
    input: (
      <div className="w-32 h-7 bg-background border border-border rounded px-2 flex items-center">
        <span className="text-[10px] text-muted-foreground">Enter text...</span>
      </div>
    ),
    card: (
      <div className="w-24 h-12 bg-background border border-border rounded-md shadow-sm p-1.5">
        <div className="w-8 h-1 bg-foreground/20 rounded mb-1" />
        <div className="w-16 h-1 bg-muted rounded" />
      </div>
    ),
    checkbox: (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-foreground rounded-sm flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-[10px] text-foreground">Checked</span>
      </div>
    ),
    switch: (
      <div className="w-9 h-5 bg-foreground rounded-full relative">
        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-background rounded-full" />
      </div>
    ),
    select: (
      <div className="w-28 h-7 bg-background border border-border rounded px-2 flex items-center justify-between">
        <span className="text-[10px] text-foreground">Select...</span>
        <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    ),
    badge: (
      <div className="flex gap-1.5">
        <span className="px-2 py-0.5 bg-foreground text-background rounded-full text-[9px] font-medium">Badge</span>
        <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-[9px] font-medium">New</span>
      </div>
    ),
    avatar: (
      <div className="flex -space-x-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-background" />
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 border-2 border-background" />
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-background" />
      </div>
    ),
    tabs: (
      <div className="flex bg-muted rounded-md p-0.5">
        <div className="px-3 py-1 bg-background rounded text-[10px] font-medium text-foreground shadow-sm">Tab 1</div>
        <div className="px-3 py-1 text-[10px] text-muted-foreground">Tab 2</div>
        <div className="px-3 py-1 text-[10px] text-muted-foreground">Tab 3</div>
      </div>
    ),
    dialog: (
      <div className="w-24 h-14 bg-background border border-border rounded-lg shadow-lg p-2">
        <div className="w-12 h-1.5 bg-foreground/20 rounded mb-1" />
        <div className="w-16 h-1 bg-muted rounded" />
        <div className="flex justify-end gap-1 mt-2">
          <div className="w-6 h-3 bg-muted rounded text-[6px]" />
          <div className="w-6 h-3 bg-foreground rounded text-[6px]" />
        </div>
      </div>
    ),
    slider: (
      <div className="w-28 h-4 flex items-center">
        <div className="w-full h-1.5 bg-muted rounded-full relative">
          <div className="absolute left-0 top-0 w-1/2 h-full bg-foreground rounded-full" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full border-2 border-background" />
        </div>
      </div>
    ),
    progress: (
      <div className="w-28 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full w-2/3 bg-foreground rounded-full" />
      </div>
    ),
    skeleton: (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        <div className="space-y-1">
          <div className="w-16 h-2 bg-muted rounded animate-pulse" />
          <div className="w-12 h-2 bg-muted rounded animate-pulse" />
        </div>
      </div>
    ),
    tooltip: (
      <div className="relative">
        <div className="px-2 py-1 bg-foreground text-background rounded text-[9px] font-medium">Tooltip</div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
      </div>
    ),
    alert: (
      <div className="w-32 h-10 bg-background border border-border rounded-md p-2 flex items-start gap-1.5">
        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="w-10 h-1.5 bg-foreground/20 rounded" />
          <div className="w-16 h-1 bg-muted rounded" />
        </div>
      </div>
    ),
    accordion: (
      <div className="w-28 space-y-0.5">
        <div className="h-5 bg-background border border-border rounded px-2 flex items-center justify-between">
          <div className="w-12 h-1.5 bg-foreground/30 rounded" />
          <svg className="w-2 h-2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="h-5 bg-muted/50 border border-border rounded px-2 flex items-center justify-between">
          <div className="w-10 h-1.5 bg-muted-foreground/30 rounded" />
          <svg className="w-2 h-2 text-muted-foreground rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    ),
    table: (
      <div className="w-32 bg-background border border-border rounded overflow-hidden">
        <div className="flex border-b border-border bg-muted/50">
          <div className="w-1/3 h-4 px-1 flex items-center"><div className="w-full h-1 bg-foreground/20 rounded" /></div>
          <div className="w-1/3 h-4 px-1 flex items-center"><div className="w-full h-1 bg-foreground/20 rounded" /></div>
          <div className="w-1/3 h-4 px-1 flex items-center"><div className="w-full h-1 bg-foreground/20 rounded" /></div>
        </div>
        <div className="flex border-b border-border/50">
          <div className="w-1/3 h-3 px-1 flex items-center"><div className="w-3/4 h-0.5 bg-muted rounded" /></div>
          <div className="w-1/3 h-3 px-1 flex items-center"><div className="w-2/3 h-0.5 bg-muted rounded" /></div>
          <div className="w-1/3 h-3 px-1 flex items-center"><div className="w-full h-0.5 bg-muted rounded" /></div>
        </div>
      </div>
    ),
    "animated-beam": (
      <div className="relative w-24 h-8">
        <div className="absolute left-0 top-1/2 w-3 h-3 rounded-full bg-sky-500" />
        <div className="absolute right-0 top-1/2 w-3 h-3 rounded-full bg-emerald-500" />
        <div className="absolute inset-0 top-1/2 h-0.5 bg-gradient-to-r from-sky-500 via-muted to-emerald-500" />
      </div>
    ),
    "bento-grid": (
      <div className="grid grid-cols-3 gap-0.5 w-20 h-12">
        <div className="col-span-2 row-span-2 bg-muted rounded-sm" />
        <div className="bg-muted rounded-sm" />
        <div className="bg-muted rounded-sm" />
      </div>
    ),
    marquee: (
      <div className="w-28 overflow-hidden">
        <div className="flex gap-2">
          <div className="w-6 h-6 bg-muted rounded shrink-0" />
          <div className="w-6 h-6 bg-muted rounded shrink-0" />
          <div className="w-6 h-6 bg-muted rounded shrink-0" />
          <div className="w-6 h-6 bg-muted rounded shrink-0" />
        </div>
      </div>
    ),
    "shimmer-button": (
      <div className="px-4 py-1.5 rounded bg-gradient-to-r from-muted via-foreground/10 to-muted text-[10px] font-medium text-foreground relative overflow-hidden">
        Shimmer
      </div>
    ),
    "3d-card": (
      <div className="w-16 h-12 bg-gradient-to-br from-muted to-muted/50 rounded-lg shadow-lg" />
    ),
    spotlight: (
      <div className="relative w-20 h-10 bg-background rounded overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-radial from-muted-foreground/20 to-transparent rounded-full" />
      </div>
    ),
  }

  return previews[baseId] || previews[componentId] || (
    <div className="text-[10px] text-muted-foreground font-medium px-2 text-center">
      {componentId.replace(/^(magic|aceternity|ext|origin)-/, "").replace(/-/g, " ")}
    </div>
  )
}

export default ComponentCard
