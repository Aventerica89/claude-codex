"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollableContainerProps {
  children: React.ReactNode
  className?: string
  fadeClassName?: string
  maxHeight?: string
}

export function ScrollableContainer({
  children,
  className,
  fadeClassName = "from-background",
  maxHeight = "600px",
}: ScrollableContainerProps) {
  return (
    <div className="relative">
      <div
        className={cn(
          "overflow-y-auto scrollbar-hide pr-2",
          className
        )}
        style={{ maxHeight }}
      >
        {children}
      </div>
      {/* Bottom fade gradient */}
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t to-transparent",
          fadeClassName
        )}
      />
    </div>
  )
}

export default ScrollableContainer
