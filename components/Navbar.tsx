'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[#fafaf8]/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link href="/" className="font-display font-extrabold text-xl text-primary">
          Upgrade<span className="text-accent">Stacks</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-500 hover:text-accent text-sm font-medium transition-colors">
            Home
          </Link>
          <Link href="/category" className="text-gray-500 hover:text-accent text-sm font-medium transition-colors">
            Browse
          </Link>
          <Link href="/submit" className="text-gray-500 hover:text-accent text-sm font-medium transition-colors">
            Submit Tool
          </Link>
          <Link href="/about" className="text-gray-500 hover:text-accent text-sm font-medium transition-colors">
            About
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/submit"
            className="bg-accent text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity hidden md:block"
          >
            Submit a Tool
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link href="/" onClick={() => setOpen(false)} className="block text-gray-600 py-2">
            Home
          </Link>
          <Link href="/category" onClick={() => setOpen(false)} className="block text-gray-600 py-2">
            Browse Stacks
          </Link>
          <Link href="/submit" onClick={() => setOpen(false)} className="block text-gray-600 py-2">
            Submit Tool
          </Link>
          <Link href="/about" onClick={() => setOpen(false)} className="block text-gray-600 py-2">
            About
          </Link>
          <Link
            href="/submit"
            onClick={() => setOpen(false)}
            className="block bg-accent text-white text-center py-2 rounded-full font-semibold mt-2"
          >
            Submit a Tool
          </Link>
        </div>
      )}
    </nav>
  )
}
