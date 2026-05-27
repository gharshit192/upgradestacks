'use client'
// components/ShareButtons.tsx
// Handles copy link, WhatsApp share, Twitter share — all with tracking

import { useState } from 'react'

interface Props {
  slug: string
  name: string
}

export default function ShareButtons({ slug, name }: Props) {
  const [copied, setCopied] = useState(false)
  const url = `https://upgradestacks.com/stack/${slug}`
  const text = `Check out the ${name} Stack — best tools for ${name}s:`

  const track = (platform: string) => {
    fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profession_slug: slug, platform }),
    }).catch(() => {})
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      track('copy')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleWhatsApp = () => {
    track('whatsapp')
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
  }

  const handleTwitter = () => {
    track('twitter')
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const handleLinkedIn = () => {
    track('linkedin')
    window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
  }

  return (
    <div className="space-y-2">
      {/* Copy link */}
      <button
        onClick={handleCopy}
        className="w-full bg-accent text-white py-2.5 rounded-full text-sm font-semibold
                   hover:opacity-90 transition-all flex items-center justify-center gap-2"
      >
        {copied ? '✅ Copied!' : '🔗 Copy Stack Link'}
      </button>

      {/* WhatsApp */}
      <button
        onClick={handleWhatsApp}
        className="w-full bg-[#25D366] text-white py-2.5 rounded-full text-sm font-semibold
                   hover:opacity-90 transition-all flex items-center justify-center gap-2"
      >
        💬 Share on WhatsApp
      </button>

      {/* Twitter / X */}
      <button
        onClick={handleTwitter}
        className="w-full bg-black text-white py-2.5 rounded-full text-sm font-semibold
                   hover:opacity-90 transition-all flex items-center justify-center gap-2"
      >
        𝕏 Share on Twitter
      </button>

      {/* LinkedIn */}
      <button
        onClick={handleLinkedIn}
        className="w-full bg-[#0077B5] text-white py-2.5 rounded-full text-sm font-semibold
                   hover:opacity-90 transition-all flex items-center justify-center gap-2"
      >
        💼 Share on LinkedIn
      </button>
    </div>
  )
}
