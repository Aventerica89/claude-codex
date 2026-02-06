"use client"

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { CardSize } from './CardSizeToggle'

interface LivePreviewProps {
  componentId: string
  size: CardSize
}

export function LiveComponentPreview({ componentId, size }: LivePreviewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: false, amount: 0.2 })
  const baseId = componentId.replace(/^(magic|aceternity|ext|origin)-/, '')
  const Preview = PREVIEW_MAP[baseId] ?? PREVIEW_MAP[componentId]

  return (
    <div ref={ref} className="w-full h-full flex items-center justify-center">
      {inView && Preview ? (
        <div className={cn(
          'transition-transform origin-center',
          size === 'compact' && 'scale-75',
          size === 'large' && 'scale-110'
        )}>
          <Preview />
        </div>
      ) : (
        <span className="text-[10px] text-muted-foreground font-medium px-2 text-center">
          {baseId.replace(/-/g, ' ')}
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Interactive Previews (useState + click/drag)
// ---------------------------------------------------------------------------

function SwitchPreview() {
  const [on, setOn] = useState(true)
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={cn(
        'w-9 h-5 rounded-full relative transition-colors',
        on ? 'bg-violet-600' : 'bg-muted'
      )}
    >
      <motion.div
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
        animate={{ left: on ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

function CheckboxPreview() {
  const [checked, setChecked] = useState(true)
  return (
    <button
      onClick={() => setChecked((v) => !v)}
      className="flex items-center gap-2"
    >
      <div className={cn(
        'w-4 h-4 rounded-sm border transition-colors flex items-center justify-center',
        checked ? 'bg-violet-600 border-violet-600' : 'border-muted-foreground/40'
      )}>
        <motion.svg
          className="w-2.5 h-2.5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </div>
      <span className="text-[10px] text-foreground">
        {checked ? 'Checked' : 'Unchecked'}
      </span>
    </button>
  )
}

function RadioGroupPreview() {
  const [val, setVal] = useState('a')
  const options = ['a', 'b', 'c']
  return (
    <div className="flex gap-3">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => setVal(o)}
          className="flex items-center gap-1"
        >
          <div className={cn(
            'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center',
            val === o ? 'border-violet-600' : 'border-muted-foreground/40'
          )}>
            {val === o && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-violet-600"
                layoutId="radio-dot"
              />
            )}
          </div>
          <span className="text-[9px] text-muted-foreground uppercase">{o}</span>
        </button>
      ))}
    </div>
  )
}

function TabsPreview() {
  const [tab, setTab] = useState(0)
  const tabs = ['Tab 1', 'Tab 2', 'Tab 3']
  return (
    <div className="flex bg-muted rounded-md p-0.5 relative">
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => setTab(i)}
          className={cn(
            'px-3 py-1 text-[10px] rounded relative z-10 transition-colors',
            tab === i ? 'text-foreground font-medium' : 'text-muted-foreground'
          )}
        >
          {tab === i && (
            <motion.div
              layoutId="tab-bg"
              className="absolute inset-0 bg-background rounded shadow-sm"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{t}</span>
        </button>
      ))}
    </div>
  )
}

function SliderPreview() {
  const [value, setValue] = useState(50)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const handleMove = (clientX: number) => {
    if (!trackRef.current || !dragging.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    setValue(Math.round(pct))
  }

  useEffect(() => {
    const up = () => { dragging.current = false }
    const move = (e: MouseEvent) => handleMove(e.clientX)
    const touchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX)
    window.addEventListener('mouseup', up)
    window.addEventListener('mousemove', move)
    window.addEventListener('touchend', up)
    window.addEventListener('touchmove', touchMove)
    return () => {
      window.removeEventListener('mouseup', up)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('touchend', up)
      window.removeEventListener('touchmove', touchMove)
    }
  }, [])

  return (
    <div
      ref={trackRef}
      className="w-28 h-5 flex items-center cursor-pointer"
      onMouseDown={(e) => { dragging.current = true; handleMove(e.clientX) }}
      onTouchStart={(e) => { dragging.current = true; handleMove(e.touches[0].clientX) }}
    >
      <div className="w-full h-1.5 bg-muted rounded-full relative">
        <div
          className="absolute left-0 top-0 h-full bg-violet-600 rounded-full"
          style={{ width: `${value}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-violet-600 rounded-full border-2 border-background shadow"
          style={{ left: `${value}%`, transform: `translateX(-50%) translateY(-50%)` }}
        />
      </div>
    </div>
  )
}

function InputPreview() {
  return (
    <input
      type="text"
      placeholder="Type here..."
      className="w-28 h-7 bg-background border border-border rounded px-2 text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
    />
  )
}

function TextareaPreview() {
  return (
    <textarea
      placeholder="Enter text..."
      rows={2}
      className="w-28 h-10 bg-background border border-border rounded px-2 py-1 text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
    />
  )
}

function SelectPreview() {
  const [open, setOpen] = useState(false)
  const [val, setVal] = useState('')
  const opts = ['React', 'Vue', 'Svelte']
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-28 h-7 bg-background border border-border rounded px-2 flex items-center justify-between text-[10px]"
      >
        <span className={val ? 'text-foreground' : 'text-muted-foreground'}>
          {val || 'Select...'}
        </span>
        <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-8 left-0 w-28 bg-background border border-border rounded shadow-lg z-20 overflow-hidden"
          >
            {opts.map((o) => (
              <button
                key={o}
                onClick={() => { setVal(o); setOpen(false) }}
                className="w-full px-2 py-1 text-[10px] text-left hover:bg-muted text-foreground"
              >
                {o}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DropdownMenuPreview() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1.5 bg-foreground text-background rounded text-[10px] font-medium"
      >
        Menu
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-8 left-0 w-24 bg-background border border-border rounded shadow-lg z-20 py-1"
          >
            {['Edit', 'Copy', 'Delete'].map((item) => (
              <button
                key={item}
                onClick={() => setOpen(false)}
                className="w-full px-2 py-1 text-[10px] text-left hover:bg-muted text-foreground"
              >
                {item}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AccordionPreview() {
  const [openIdx, setOpenIdx] = useState(0)
  const items = ['Section 1', 'Section 2']
  return (
    <div className="w-28 space-y-0.5">
      {items.map((item, i) => (
        <div key={item}>
          <button
            onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
            className="w-full h-5 bg-background border border-border rounded px-2 flex items-center justify-between"
          >
            <span className="text-[9px] text-foreground">{item}</span>
            <motion.svg
              className="w-2 h-2 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              animate={{ rotate: openIdx === i ? 180 : 0 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {openIdx === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-2 py-1 text-[8px] text-muted-foreground">
                  Content for {item.toLowerCase()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

function CommandPreview() {
  const [query, setQuery] = useState('')
  const items = ['Home', 'Settings', 'Profile']
  const filtered = items.filter((i) => i.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="w-32 bg-background border border-border rounded-lg overflow-hidden shadow">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border">
        <svg className="w-2.5 h-2.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="flex-1 bg-transparent text-[9px] text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
      <div className="py-0.5">
        {filtered.map((item) => (
          <div key={item} className="px-2 py-0.5 text-[9px] text-foreground hover:bg-muted cursor-default">
            {item}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-2 py-1 text-[8px] text-muted-foreground">No results</div>
        )}
      </div>
    </div>
  )
}

function CalendarPreview() {
  const [selected, setSelected] = useState(15)
  const days = Array.from({ length: 28 }, (_, i) => i + 1)
  return (
    <div className="grid grid-cols-7 gap-px w-28">
      {['M','T','W','T','F','S','S'].map((d, i) => (
        <div key={`h-${i}`} className="text-[6px] text-muted-foreground text-center">{d}</div>
      ))}
      {days.map((d) => (
        <button
          key={d}
          onClick={() => setSelected(d)}
          className={cn(
            'w-3.5 h-3.5 text-[6px] rounded-sm flex items-center justify-center transition-colors',
            selected === d
              ? 'bg-violet-600 text-white'
              : 'text-foreground hover:bg-muted'
          )}
        >
          {d}
        </button>
      ))}
    </div>
  )
}

function ScrollAreaPreview() {
  return (
    <div className="w-28 h-14 overflow-y-auto rounded border border-border bg-background scrollbar-thin">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="px-2 py-0.5 text-[8px] text-foreground border-b border-border/30">
          Item {i + 1}
        </div>
      ))}
    </div>
  )
}

function NavigationMenuPreview() {
  const [hover, setHover] = useState<number | null>(null)
  const items = ['Home', 'Docs', 'Blog']
  return (
    <div className="flex gap-2 relative">
      {items.map((item, i) => (
        <div
          key={item}
          className="relative"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <span className={cn(
            'text-[10px] cursor-default transition-colors',
            hover === i ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {item}
          </span>
          <AnimatePresence>
            {hover === i && i === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 2 }}
                className="absolute top-4 left-0 w-20 bg-background border border-border rounded shadow-lg py-1 z-20"
              >
                {['Guide', 'API', 'FAQ'].map((sub) => (
                  <div key={sub} className="px-2 py-0.5 text-[8px] text-foreground hover:bg-muted">
                    {sub}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Animated Previews (auto-animate, no interaction needed)
// ---------------------------------------------------------------------------

function ProgressPreview() {
  const [pct, setPct] = useState(20)
  useEffect(() => {
    const id = setInterval(() => {
      setPct((v) => (v >= 100 ? 0 : v + 8))
    }, 600)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="w-28 h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-violet-600 rounded-full"
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4 }}
      />
    </div>
  )
}

function SkeletonPreview() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
      <div className="space-y-1">
        <div className="w-16 h-2 bg-muted rounded animate-pulse" />
        <div className="w-12 h-2 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}

function ShimmerButtonPreview() {
  return (
    <div className="relative px-4 py-1.5 rounded-lg overflow-hidden bg-neutral-900">
      <div className="absolute inset-0 shimmer-gradient" />
      <span className="relative text-[10px] font-medium text-white">Shimmer</span>
      <style>{`
        .shimmer-gradient {
          background: linear-gradient(
            110deg, transparent 25%, rgba(255,255,255,0.15) 50%, transparent 75%
          );
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

function MarqueePreview() {
  return (
    <div className="w-28 overflow-hidden">
      <motion.div
        className="flex gap-2 w-max"
        animate={{ x: [0, -80] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      >
        {[1,2,3,4,1,2,3,4].map((n, i) => (
          <div key={i} className="w-6 h-6 bg-muted rounded shrink-0 flex items-center justify-center text-[8px] text-muted-foreground">
            {n}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

function AnimatedBeamPreview() {
  return (
    <div className="relative w-28 h-8 flex items-center">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-violet-500/20 border border-violet-500/50 z-10" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/50 z-10" />
      <div className="absolute left-4 right-4 top-1/2 h-px bg-border" />
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 h-0.5 w-8 rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, #8b5cf6, transparent)' }}
        animate={{ left: ['12px', '60px'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

function TextGeneratePreview() {
  const text = 'AI writes code'
  const [len, setLen] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setLen((v) => (v >= text.length ? 0 : v + 1))
    }, 150)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="text-[10px] text-foreground font-mono h-4">
      {text.slice(0, len)}
      <span className="animate-pulse">|</span>
    </div>
  )
}

function GlobePreview() {
  return (
    <div className="relative w-12 h-12">
      <motion.div
        className="w-12 h-12 rounded-full border border-muted-foreground/30"
        style={{
          background: 'radial-gradient(circle at 35% 35%, hsl(var(--muted)) 0%, transparent 60%)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 rounded-full border border-dashed border-muted-foreground/20" />
        <div className="absolute inset-2 rounded-full border border-dashed border-muted-foreground/15 rotate-45" />
      </motion.div>
    </div>
  )
}

function ParticlesPreview() {
  return (
    <div className="relative w-24 h-10 overflow-hidden rounded">
      {[0,1,2,3,4,5].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-violet-500/50"
          initial={{ x: i * 16, y: Math.random() * 30 }}
          animate={{
            y: [Math.random() * 30, Math.random() * 30, Math.random() * 30],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function Card3DPreview() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  return (
    <motion.div
      className="w-16 h-12 bg-gradient-to-br from-muted to-muted/50 rounded-lg border border-border shadow-lg cursor-pointer"
      style={{ perspective: 400, transformStyle: 'preserve-3d' }}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientY - rect.top) / rect.height - 0.5) * -10
        const y = ((e.clientX - rect.left) / rect.width - 0.5) * 10
        setTilt({ x, y })
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className="p-1.5">
        <div className="w-6 h-1 bg-foreground/15 rounded mb-0.5" />
        <div className="w-10 h-0.5 bg-muted-foreground/20 rounded" />
      </div>
    </motion.div>
  )
}

function SpotlightPreview() {
  const [pos, setPos] = useState({ x: 50, y: 50 })
  return (
    <div
      className="relative w-24 h-10 bg-background rounded border border-border overflow-hidden cursor-crosshair"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setPos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        })
      }}
    >
      <div
        className="absolute w-16 h-16 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

function BackgroundBeamsPreview() {
  return (
    <div className="relative w-28 h-10 bg-background rounded overflow-hidden">
      {[0,1,2].map((i) => (
        <motion.div
          key={i}
          className="absolute h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"
          style={{ top: `${25 + i * 25}%`, width: '140%', left: '-20%' }}
          animate={{ x: ['-10%', '10%', '-10%'] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function LampPreview() {
  return (
    <div className="relative w-24 h-12 overflow-hidden flex flex-col items-center">
      <div className="w-16 h-px bg-violet-500" />
      <div
        className="w-20 h-10"
        style={{
          background: 'linear-gradient(180deg, rgba(139,92,246,0.3) 0%, transparent 100%)',
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Enhanced Static Previews (shown in "open" state)
// ---------------------------------------------------------------------------

function ButtonPreview() {
  return (
    <div className="flex gap-2">
      <div className="px-3 py-1.5 bg-violet-600 text-white rounded text-[10px] font-medium">
        Button
      </div>
      <div className="px-3 py-1.5 border border-border rounded text-[10px] font-medium text-foreground">
        Outline
      </div>
    </div>
  )
}

function BadgePreview() {
  return (
    <div className="flex gap-1.5">
      <span className="px-2 py-0.5 bg-violet-600 text-white rounded-full text-[9px] font-medium">
        Badge
      </span>
      <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-[9px] font-medium">
        New
      </span>
    </div>
  )
}

function CardPreview() {
  return (
    <div className="w-24 h-12 bg-background border border-border rounded-md shadow-sm p-1.5">
      <div className="w-8 h-1 bg-foreground/20 rounded mb-1" />
      <div className="w-16 h-1 bg-muted rounded" />
    </div>
  )
}

function AvatarPreview() {
  return (
    <div className="flex -space-x-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 border-2 border-background" />
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 border-2 border-background" />
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-background" />
    </div>
  )
}

function AlertPreview() {
  return (
    <div className="w-32 bg-background border border-amber-500/30 rounded-md p-2 flex items-start gap-1.5">
      <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <div className="w-10 h-1.5 bg-foreground/20 rounded" />
        <div className="w-16 h-1 bg-muted rounded" />
      </div>
    </div>
  )
}

function DialogPreview() {
  return (
    <div className="w-28 bg-background border border-border rounded-lg shadow-lg p-2">
      <div className="w-14 h-1.5 bg-foreground/20 rounded mb-1" />
      <div className="w-20 h-1 bg-muted rounded mb-2" />
      <div className="flex justify-end gap-1">
        <div className="px-2 py-0.5 bg-muted rounded text-[7px] text-muted-foreground">Cancel</div>
        <div className="px-2 py-0.5 bg-violet-600 rounded text-[7px] text-white">OK</div>
      </div>
    </div>
  )
}

function AlertDialogPreview() {
  return (
    <div className="w-28 bg-background border border-rose-500/30 rounded-lg shadow-lg p-2">
      <div className="w-10 h-1.5 bg-rose-400/30 rounded mb-1" />
      <div className="w-20 h-1 bg-muted rounded mb-2" />
      <div className="flex justify-end gap-1">
        <div className="px-2 py-0.5 bg-muted rounded text-[7px] text-muted-foreground">No</div>
        <div className="px-2 py-0.5 bg-rose-600 rounded text-[7px] text-white">Delete</div>
      </div>
    </div>
  )
}

function SheetPreview() {
  return (
    <div className="w-28 h-14 bg-background border border-border rounded-lg overflow-hidden flex">
      <div className="flex-1 bg-muted/20" />
      <div className="w-16 bg-background border-l border-border p-1.5">
        <div className="w-8 h-1 bg-foreground/20 rounded mb-1" />
        <div className="w-10 h-1 bg-muted rounded mb-0.5" />
        <div className="w-6 h-1 bg-muted rounded" />
      </div>
    </div>
  )
}

function PopoverPreview() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="w-16 bg-background border border-border rounded shadow-lg p-1.5 mb-1">
        <div className="w-10 h-1 bg-foreground/20 rounded mb-0.5" />
        <div className="w-8 h-1 bg-muted rounded" />
      </div>
      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border" />
      <div className="px-2 py-1 bg-muted rounded text-[8px] text-muted-foreground">Trigger</div>
    </div>
  )
}

function TooltipPreview() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="px-2 py-1 bg-foreground text-background rounded text-[9px] font-medium mb-0.5">
        Tooltip text
      </div>
      <div className="w-2 h-2 bg-foreground rotate-45 -mt-1.5" />
    </div>
  )
}

function BreadcrumbPreview() {
  return (
    <div className="flex items-center gap-1 text-[9px]">
      <span className="text-muted-foreground">Home</span>
      <span className="text-muted-foreground">/</span>
      <span className="text-muted-foreground">Docs</span>
      <span className="text-muted-foreground">/</span>
      <span className="text-foreground font-medium">Page</span>
    </div>
  )
}

function SeparatorPreview() {
  return (
    <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
      <span>Left</span>
      <div className="w-px h-4 bg-border" />
      <span>Right</span>
    </div>
  )
}

function LabelPreview() {
  return (
    <div className="space-y-0.5">
      <div className="text-[10px] font-medium text-foreground">Email</div>
      <div className="w-24 h-5 bg-background border border-border rounded px-1.5 flex items-center">
        <span className="text-[8px] text-muted-foreground">user@mail.com</span>
      </div>
    </div>
  )
}

function FormPreview() {
  return (
    <div className="w-28 space-y-1">
      <div className="text-[8px] font-medium text-foreground">Name</div>
      <div className="h-5 bg-background border border-border rounded px-1.5 flex items-center">
        <span className="text-[8px] text-muted-foreground">John</span>
      </div>
      <div className="text-[8px] font-medium text-foreground">Email</div>
      <div className="h-5 bg-background border border-border rounded px-1.5 flex items-center">
        <span className="text-[8px] text-muted-foreground">john@email.com</span>
      </div>
    </div>
  )
}

function TablePreview() {
  return (
    <div className="w-32 bg-background border border-border rounded overflow-hidden">
      <div className="flex border-b border-border bg-muted/50">
        <div className="w-1/3 h-4 px-1 flex items-center">
          <div className="w-full h-1 bg-foreground/20 rounded" />
        </div>
        <div className="w-1/3 h-4 px-1 flex items-center">
          <div className="w-full h-1 bg-foreground/20 rounded" />
        </div>
        <div className="w-1/3 h-4 px-1 flex items-center">
          <div className="w-full h-1 bg-foreground/20 rounded" />
        </div>
      </div>
      <div className="flex border-b border-border/50">
        <div className="w-1/3 h-3 px-1 flex items-center">
          <div className="w-3/4 h-0.5 bg-muted rounded" />
        </div>
        <div className="w-1/3 h-3 px-1 flex items-center">
          <div className="w-2/3 h-0.5 bg-muted rounded" />
        </div>
        <div className="w-1/3 h-3 px-1 flex items-center">
          <div className="w-full h-0.5 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}

function DataTablePreview() {
  return (
    <div className="w-36 bg-background border border-border rounded overflow-hidden">
      <div className="flex items-center gap-1 p-1 border-b border-border">
        <div className="w-14 h-4 bg-muted rounded px-1 flex items-center">
          <span className="text-[7px] text-muted-foreground">Filter...</span>
        </div>
        <div className="w-10 h-4 bg-muted rounded px-1 flex items-center justify-center">
          <span className="text-[7px] text-muted-foreground">Cols</span>
        </div>
      </div>
      <div className="flex border-b border-border bg-muted/50">
        <div className="w-3 h-3.5 flex items-center justify-center">
          <div className="w-2 h-2 border border-muted-foreground/30 rounded-sm" />
        </div>
        <div className="flex-1 h-3.5 px-1 flex items-center">
          <div className="w-full h-0.5 bg-foreground/20 rounded" />
        </div>
      </div>
      <div className="flex border-b border-border/30">
        <div className="w-3 h-3 flex items-center justify-center">
          <div className="w-2 h-2 border border-muted-foreground/20 rounded-sm" />
        </div>
        <div className="flex-1 h-3 px-1 flex items-center">
          <div className="w-2/3 h-0.5 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}

function SonnerPreview() {
  return (
    <div className="w-32 bg-background border border-border rounded-lg shadow-lg p-2 flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50 shrink-0 flex items-center justify-center">
        <svg className="w-1.5 h-1.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="space-y-0.5">
        <div className="text-[8px] font-medium text-foreground">Success</div>
        <div className="text-[7px] text-muted-foreground">Item saved</div>
      </div>
    </div>
  )
}

function BentoGridPreview() {
  return (
    <div className="grid grid-cols-3 gap-0.5 w-24 h-14">
      <div className="col-span-2 row-span-2 bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-sm border border-border/50" />
      <div className="bg-muted/50 rounded-sm border border-border/50" />
      <div className="bg-muted/50 rounded-sm border border-border/50" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Preview Map - maps component baseId to preview component
// ---------------------------------------------------------------------------

const PREVIEW_MAP: Record<string, React.FC> = {
  // Interactive
  switch: SwitchPreview,
  checkbox: CheckboxPreview,
  'radio-group': RadioGroupPreview,
  tabs: TabsPreview,
  slider: SliderPreview,
  input: InputPreview,
  textarea: TextareaPreview,
  select: SelectPreview,
  'dropdown-menu': DropdownMenuPreview,
  accordion: AccordionPreview,
  command: CommandPreview,
  calendar: CalendarPreview,
  'scroll-area': ScrollAreaPreview,
  'navigation-menu': NavigationMenuPreview,
  progress: ProgressPreview,

  // Animated
  skeleton: SkeletonPreview,
  'shimmer-button': ShimmerButtonPreview,
  marquee: MarqueePreview,
  'animated-beam': AnimatedBeamPreview,
  'text-generate': TextGeneratePreview,
  globe: GlobePreview,
  particles: ParticlesPreview,
  '3d-card': Card3DPreview,
  spotlight: SpotlightPreview,
  'background-beams': BackgroundBeamsPreview,
  lamp: LampPreview,

  // Enhanced static
  button: ButtonPreview,
  badge: BadgePreview,
  card: CardPreview,
  avatar: AvatarPreview,
  alert: AlertPreview,
  dialog: DialogPreview,
  'alert-dialog': AlertDialogPreview,
  sheet: SheetPreview,
  popover: PopoverPreview,
  tooltip: TooltipPreview,
  breadcrumb: BreadcrumbPreview,
  separator: SeparatorPreview,
  label: LabelPreview,
  form: FormPreview,
  table: TablePreview,
  'data-table': DataTablePreview,
  sonner: SonnerPreview,
  'bento-grid': BentoGridPreview,
}
