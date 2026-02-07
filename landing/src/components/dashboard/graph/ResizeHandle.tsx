import { useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical'
  onResize: (delta: number) => void
  className?: string
}

export function ResizeHandle({
  direction,
  onResize,
  className,
}: ResizeHandleProps) {
  const startPos = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const isHorizontal = direction === 'horizontal'
      startPos.current = isHorizontal ? e.clientX : e.clientY

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const current = isHorizontal
          ? moveEvent.clientX
          : moveEvent.clientY
        const delta = current - startPos.current
        startPos.current = current
        onResize(delta)
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = isHorizontal
        ? 'col-resize'
        : 'row-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [direction, onResize]
  )

  return (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        'shrink-0 bg-border hover:bg-violet-500/50 transition-colors',
        direction === 'horizontal'
          ? 'w-1 cursor-col-resize hover:w-1.5'
          : 'h-1 cursor-row-resize hover:h-1.5',
        className
      )}
    />
  )
}
