'use client'
// components/ViewTracker.tsx
// Invisible component — just records a view on mount

import { useEffect } from 'react'

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    // Fire and forget — don't block rendering
    fetch('/api/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profession_slug: slug }),
    }).catch(() => {}) // silently ignore errors
  }, [slug])

  return null // renders nothing
}
