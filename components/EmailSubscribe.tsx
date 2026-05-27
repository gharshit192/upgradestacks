'use client'
// components/EmailSubscribe.tsx

import { useState } from 'react'

interface Props {
  professionSlug: string
}

export default function EmailSubscribe({ professionSlug }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) return
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, profession_slug: professionSlug }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-2">
        <p className="text-green-600 font-semibold text-sm">✅ You're subscribed!</p>
        <p className="text-gray-400 text-xs mt-1">We'll notify you when new tools are added.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                   focus:outline-none focus:border-accent bg-gray-50 focus:bg-white transition-colors"
      />
      {status === 'error' && <p className="text-red-500 text-xs">Something went wrong.</p>}
      <button
        onClick={handleSubmit}
        disabled={status === 'loading'}
        className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold
                   hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
      </button>
    </div>
  )
}
