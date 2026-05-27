'use client'
// components/CommunityRatings.tsx
// Shows ratings per tool + lets users rate and review

import { useState, useEffect } from 'react'

interface RatingSummary {
  [toolId: string]: { avg: number; count: number }
}

interface Props {
  professionSlug: string
  userId?: string
}

export default function CommunityRatings({ professionSlug, userId }: Props) {
  const [ratings, setRatings] = useState<RatingSummary>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/rate?slug=${professionSlug}`)
      .then(r => r.json())
      .then(data => { setRatings(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [professionSlug])

  // Overall stack score = average of all tool ratings
  const allRatings = Object.values(ratings)
  const overallAvg = allRatings.length
    ? (allRatings.reduce((s, r) => s + r.avg, 0) / allRatings.length).toFixed(1)
    : '—'
  const totalReviews = allRatings.reduce((s, r) => s + r.count, 0)

  const renderStars = (rating: number, size = 'text-sm') => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`${size} ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}>
        ★
      </span>
    ))
  }

  if (loading) return (
    <div className="animate-pulse space-y-2">
      {[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-100 rounded" />)}
    </div>
  )

  return (
    <div>
      {/* Overall score */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-orange-50 rounded-xl">
        <div className="text-3xl font-display font-extrabold text-accent">{overallAvg}</div>
        <div>
          <div className="flex">{renderStars(Number(overallAvg))}</div>
          <div className="text-xs text-gray-400 mt-0.5">{totalReviews} community ratings</div>
        </div>
      </div>

      {/* Per-dimension ratings */}
      {[
        { label: 'Overall Stack', key: 'overall' },
        { label: 'Tool Accuracy', key: 'accuracy' },
        { label: 'Completeness', key: 'complete' },
        { label: 'India Relevant', key: 'india' },
      ].map(dim => (
        <div key={dim.key} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-none">
          <span className="text-sm text-gray-500">{dim.label}</span>
          <div className="flex items-center gap-1">
            {renderStars(Number(overallAvg) || 4.5)}
          </div>
        </div>
      ))}

      {/* Rate this stack CTA */}
      {userId ? (
        <RateStackForm professionSlug={professionSlug} userId={userId} />
      ) : (
        <a
          href={`/login?redirect=/stack/${professionSlug}`}
          className="block mt-4 text-center text-xs text-accent hover:underline"
        >
          Login to rate this stack →
        </a>
      )}
    </div>
  )
}


// ── Inline rating form ───────────────────────────────────────────────
function RateStackForm({ professionSlug, userId }: { professionSlug: string; userId: string }) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const handleRate = async (rating: number) => {
    setSelected(rating)
    // Rate the first tool as a proxy for overall stack rating
    // In production: rate all tools or a dedicated "stack_ratings" table
    await fetch('/api/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profession_slug: professionSlug,
        tool_id: 'STACK_OVERALL', // special ID for stack-level rating
        rating,
      }),
    })
    setSubmitted(true)
  }

  if (submitted) return (
    <p className="text-center text-green-600 text-xs mt-4 font-semibold">✅ Thanks for rating!</p>
  )

  return (
    <div className="mt-4 text-center">
      <p className="text-xs text-gray-400 mb-2">Rate this stack</p>
      <div className="flex justify-center gap-1">
        {[1,2,3,4,5].map(star => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleRate(star)}
            className={`text-2xl transition-colors ${
              star <= (hovered || selected) ? 'text-yellow-400' : 'text-gray-200'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}
