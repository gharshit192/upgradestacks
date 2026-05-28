'use client'

import { useState } from 'react'

interface ShareButtonProps {
  slug: string
  name: string
}

export function ShareButton({ slug, name }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const url = `https://upgradestacks.com/stack/${slug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: alert if copy fails
      alert('Failed to copy. Please try again.')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full bg-accent text-white py-2 rounded-full text-sm font-semibold
                 hover:opacity-90 transition-opacity"
    >
      {copied ? '✅ Link Copied!' : '🔗 Copy Stack Link'}
    </button>
  )
}
