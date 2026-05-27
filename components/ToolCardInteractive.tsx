'use client'
// components/ToolCardInteractive.tsx
// Full-featured tool card with rating, vote, and save buttons

import { useState } from 'react'
import Link from 'next/link'
import type { StackConnection, Tool } from '@/lib/types'

interface Props {
  connection: StackConnection & { tool: Tool }
  userId?: string
  initialRating?: { avg: number; count: number }
  initialVotes?: { up: number; down: number }
  initialSaved?: boolean
}

export default function ToolCardInteractive({
  connection,
  userId,
  initialRating,
  initialVotes,
  initialSaved = false,
}: Props) {
  const { tool, importance, custom_desc, cta_text, show_price } = connection
  const description = custom_desc || tool.short_desc
  const href = tool.affiliate_url || tool.website_url

  const [votes, setVotes] = useState(initialVotes || { up: 0, down: 0 })
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [saved, setSaved] = useState(initialSaved)
  const [rating, setRating] = useState(initialRating || { avg: tool.rating, count: 0 })
  const [showRateForm, setShowRateForm] = useState(false)
  const [hoverStar, setHoverStar] = useState(0)
  const [userRating, setUserRating] = useState(0)

  const importanceColors: Record<string, string> = {
    Essential: 'bg-red-50 text-red-700',
    Recommended: 'bg-green-50 text-green-700',
    Optional: 'bg-gray-100 text-gray-500',
  }

  const handleVote = async (vote: 'up' | 'down') => {
    if (!userId) return

    const newVote = userVote === vote ? null : vote
    const diff = (vote === 'up' ? 1 : -1) * (userVote === vote ? -1 : 1)

    setUserVote(newVote)
    setVotes(v => ({
      up: v.up + (vote === 'up' ? diff : 0),
      down: v.down + (vote === 'down' ? diff : 0),
    }))

    await fetch('/api/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profession_slug: connection.profession_slug,
        tool_id: tool.tool_id,
        vote: newVote,
      }),
    }).catch(() => {})
  }

  const handleSave = async () => {
    if (!userId) { window.location.href = '/login'; return }
    const newSaved = !saved
    setSaved(newSaved)

    await fetch('/api/save-stack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profession_slug: connection.profession_slug,
        tool_id: tool.tool_id,
        action: newSaved ? 'save_tool' : 'unsave_tool',
      }),
    }).catch(() => {})
  }

  const handleRate = async (star: number) => {
    if (!userId) { window.location.href = '/login'; return }
    setUserRating(star)
    setShowRateForm(false)

    // Optimistically update displayed rating
    const newCount = rating.count + 1
    const newAvg = ((rating.avg * rating.count) + star) / newCount
    setRating({ avg: parseFloat(newAvg.toFixed(1)), count: newCount })

    await fetch('/api/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profession_slug: connection.profession_slug,
        tool_id: tool.tool_id,
        rating: star,
      }),
    }).catch(() => {})
  }

  const isFree = tool.pricing_type === 'Free' || tool.has_free_plan

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-accent
                    hover:shadow-sm transition-all group">

      {/* Main row */}
      <div className="flex items-start gap-4">

        {/* Logo */}
        <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center
                        text-2xl flex-shrink-0 group-hover:bg-orange-50 transition-colors">
          {tool.logo_emoji || '🔧'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-display font-bold text-sm text-primary">{tool.name}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${importanceColors[importance] || importanceColors.Optional}`}>
              {importance}
            </span>
            {tool.verified && (
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                ✓ Verified
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{description}</p>

          {/* Stars */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <button
              onClick={() => setShowRateForm(!showRateForm)}
              className="flex items-center gap-0.5 hover:opacity-80 transition-opacity"
              title="Rate this tool"
            >
              {[1,2,3,4,5].map(s => (
                <span key={s} className={`text-xs ${s <= Math.round(rating.avg) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
              ))}
            </button>
            <span className="text-[10px] text-gray-400">{rating.avg} ({rating.count})</span>
          </div>

          {/* Inline star rating form */}
          {showRateForm && (
            <div className="flex items-center gap-1 mt-2 bg-yellow-50 px-3 py-2 rounded-lg">
              <span className="text-xs text-gray-500 mr-1">Your rating:</span>
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => handleRate(star)}
                  className={`text-xl transition-colors ${star <= (hoverStar || userRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
              <button onClick={() => setShowRateForm(false)} className="ml-2 text-gray-300 text-xs hover:text-gray-500">✕</button>
            </div>
          )}
        </div>

        {/* Right: price + CTA */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {show_price && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              isFree ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'
            }`}>
              {tool.india_price || (isFree ? 'Free' : tool.global_price)}
            </span>
          )}
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-white px-3 py-1.5 rounded-full text-xs font-semibold
                       hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {cta_text || 'Visit →'}
          </Link>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">

        {/* Upvote */}
        <button
          onClick={() => handleVote('up')}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all
            ${userVote === 'up'
              ? 'bg-green-50 text-green-600 font-semibold'
              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            }`}
          title={userId ? 'Helpful' : 'Login to vote'}
        >
          👍 {votes.up > 0 ? votes.up : ''} Helpful
        </button>

        {/* Downvote */}
        <button
          onClick={() => handleVote('down')}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all
            ${userVote === 'down'
              ? 'bg-red-50 text-red-600 font-semibold'
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
          title={userId ? 'Not helpful' : 'Login to vote'}
        >
          👎 Not helpful
        </button>

        {/* Save tool */}
        <button
          onClick={handleSave}
          className={`ml-auto flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all
            ${saved
              ? 'bg-orange-50 text-accent font-semibold'
              : 'text-gray-400 hover:text-accent hover:bg-orange-50'
            }`}
          title={userId ? (saved ? 'Remove from my stack' : 'Add to my stack') : 'Login to save'}
        >
          {saved ? '✅ In my stack' : '+ Add to stack'}
        </button>

        {/* Link to tool page */}
        <Link
          href={`/tool/${tool.slug}`}
          className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
        >
          Details
        </Link>
      </div>
    </div>
  )
}
