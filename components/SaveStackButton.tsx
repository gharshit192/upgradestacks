'use client'
// components/SaveStackButton.tsx
// Lets logged-in users save/unsave a stack

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  slug: string
  initialSaved?: boolean
  userId?: string
}

export default function SaveStackButton({ slug, initialSaved = false, userId }: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    // Not logged in — redirect to login
    if (!userId) {
      router.push(`/login?redirect=/stack/${slug}`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/save-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profession_slug: slug,
          action: saved ? 'unsave' : 'save',
        }),
      })
      const data = await res.json()
      setSaved(data.saved)
    } catch {
      console.error('Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`w-full py-2.5 rounded-full text-sm font-semibold transition-all
        ${saved
          ? 'bg-orange-50 text-accent border border-accent'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-accent hover:text-accent'
        } disabled:opacity-50`}
    >
      {loading ? '...' : saved ? '✅ Stack Saved' : '💾 Save My Stack'}
    </button>
  )
}
