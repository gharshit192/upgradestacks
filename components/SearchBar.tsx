'use client'
// components/SearchBar.tsx
// Client component — uses Fuse.js for real-time fuzzy search

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import type { Profession } from '@/lib/types'

interface Props {
  professions: Pick<Profession, 'name' | 'slug' | 'category' | 'description'>[]
}

export default function SearchBar({ professions }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof professions>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Build Fuse index once
  const fuse = useRef(
    new Fuse(professions, {
      keys: ['name', 'category', 'description'],
      threshold: 0.35,
      minMatchCharLength: 2,
    })
  )

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    const hits = fuse.current.search(query).slice(0, 8).map(r => r.item)
    setResults(hits)
    setOpen(hits.length > 0)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navigate = (slug: string) => {
    setQuery('')
    setOpen(false)
    router.push(`/stack/${slug}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) navigate(results[0].slug)
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative max-w-xl mx-auto w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your profession or goal... e.g. Graphic Designer"
          className="w-full px-6 py-4 pr-36 rounded-full border-2 border-gray-200 focus:border-accent
                     text-base font-sans outline-none shadow-md bg-white transition-colors"
          aria-label="Search for your profession"
          aria-expanded={open}
          aria-haspopup="listbox"
          role="combobox"
        />
        <button
          onClick={() => results.length > 0 && navigate(results[0].slug)}
          className="absolute right-2 top-2 bottom-2 bg-accent text-white px-5 rounded-full
                     font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Find Stack →
        </button>
      </div>

      {/* Dropdown results */}
      {open && (
        <ul
          role="listbox"
          className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl
                     shadow-lg overflow-hidden z-50"
        >
          {results.map(prof => (
            <li
              key={prof.slug}
              role="option"
              onClick={() => navigate(prof.slug)}
              className="flex items-center justify-between px-5 py-3 hover:bg-orange-50
                         cursor-pointer transition-colors border-b border-gray-50 last:border-none"
            >
              <div>
                <div className="font-semibold text-sm text-primary">{prof.name}</div>
                <div className="text-xs text-gray-400">{prof.category}</div>
              </div>
              <span className="text-accent text-xs font-medium">View Stack →</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
