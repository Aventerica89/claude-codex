"use client"

import { useState, useEffect, useCallback } from 'react'
import { renderMarkdown } from '@/lib/markdown'

interface MarkdownEditorProps {
  itemId: string
  initialContent: string
  itemName: string
  itemType: string
  hasOverride?: boolean
}

export function MarkdownEditor({
  itemId,
  initialContent,
  itemName,
  itemType,
  hasOverride = false,
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [preview, setPreview] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    setPreview(renderMarkdown(content))
  }, [content])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/codex/item/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      // Error saving
    } finally {
      setIsSaving(false)
    }
  }, [itemId, content])

  const handleReset = useCallback(async () => {
    if (!confirm('Reset to original file content?')) return
    setContent(initialContent)
    await fetch(`/api/codex/item/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: null }),
    })
  }, [itemId, initialContent])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    },
    [handleSave]
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono">{itemName}</h1>
          <p className="text-sm text-muted-foreground capitalize">{itemType}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasOverride && (
            <button
              onClick={handleReset}
              className="px-3 py-2 min-h-[44px] text-xs bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-all active:scale-95"
            >
              Reset to File
            </button>
          )}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-2 min-h-[44px] text-xs bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-all active:scale-95"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 min-h-[44px] text-xs bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white rounded-lg transition-all active:scale-95"
          >
            {isSaving ? 'Saving...' : saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-[calc(100vh-200px)] p-4 bg-card border border-border rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
            spellCheck={false}
          />
          <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            Cmd+S to save
          </span>
        </div>

        {showPreview && (
          <div
            className="h-[calc(100vh-200px)] p-6 bg-card border border-border rounded-xl overflow-y-auto prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        )}
      </div>
    </div>
  )
}
