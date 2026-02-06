"use client"

import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { ToastProvider } from '../ui/Toast'

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPath: string
}

export function DashboardLayout({ children, currentPath }: DashboardLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    const auth = sessionStorage.getItem('codex-auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()

      if (data.success) {
        setIsAuthenticated(true)
        sessionStorage.setItem('codex-auth', 'true')
      } else {
        setError('Incorrect PIN')
        setPin('')
      }
    } catch {
      setError('Verification failed')
      setPin('')
    } finally {
      setIsVerifying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                <path d="M6 10a6 6 0 0 0 12 0" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Claude Codex Dashboard</h1>
            <p className="text-muted-foreground">Enter PIN to continue</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''))
                  setError('')
                }}
                placeholder="Enter 4-digit PIN"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                autoFocus
                disabled={isVerifying}
              />
              {error && (
                <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={pin.length !== 4 || isVerifying}
              className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
            >
              {isVerifying ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar currentPath={currentPath} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  )
}

export default DashboardLayout
