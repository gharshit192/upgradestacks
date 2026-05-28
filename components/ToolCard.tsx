// components/ToolCard.tsx
'use client'

import Link from 'next/link'
import type { StackConnection, Tool } from '@/lib/types'
import clsx from 'clsx'

interface Props {
  connection: StackConnection & { tool: Tool }
}

export default function ToolCard({ connection }: Props) {
  const { tool, importance, custom_desc, cta_text, show_price } = connection
  const description = custom_desc || tool.short_desc
  const href = tool.affiliate_url || tool.website_url

  const importanceClass = {
    Essential: 'importance-essential',
    Recommended: 'importance-recommended',
    Optional: 'importance-optional',
  }[importance]

  const isFree = tool.pricing_type === 'Free' || tool.has_free_plan

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4
                    hover:border-accent hover:shadow-sm transition-all group">

      {/* Logo */}
      <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center
                      flex-shrink-0 group-hover:bg-orange-50 transition-colors overflow-hidden">
        <img
          src={`https://www.google.com/s2/favicons?domain=${new URL(tool.website_url).hostname}&sz=64`}
          alt={tool.name}
          className="w-8 h-8 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.parentElement!.innerHTML =
              `<span class="text-lg font-bold text-orange-500">
                ${tool.name.charAt(0)}
              </span>`
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-display font-bold text-sm text-primary">{tool.name}</span>
          <span className={importanceClass}>{importance}</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {show_price && (
          <span className={isFree ? 'price-free' : 'price-paid'}>
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
  )
}
