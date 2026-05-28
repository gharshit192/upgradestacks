// app/page.tsx
// Homepage — Server Component (fast, SEO-friendly)

import { Suspense } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SearchBar from '@/components/SearchBar'
import { getAllProfessions, getFeaturedProfessions, getSiteStats } from '@/lib/supabase'

// Revalidate every 24 hours
export const revalidate = 86400

const CATEGORIES = [
  { icon: '🎨', name: 'Creative', slug: 'creative', count: '52+' },
  { icon: '💻', name: 'Tech & Dev', slug: 'technology', count: '99+' },
  { icon: '📊', name: 'Finance', slug: 'finance', count: '10+' },
  { icon: '🚀', name: 'Business', slug: 'business', count: '49+' },
  { icon: '💪', name: 'Health', slug: 'health', count: '8+' },
  { icon: '📚', name: 'Education', slug: 'education', count: '8+' },
  { icon: '🏠', name: 'Lifestyle', slug: 'lifestyle', count: '8+' },
  { icon: '📢', name: 'Marketing', slug: 'marketing', count: '8+' },
]

const HINTS = [
  { label: '📊 Chartered Accountant', slug: 'chartered-accountant' },
  { label: '💻 Certified Software Engineer', slug: 'certified-software-engineer' },
  { label: '📈 Certified Data Analyst', slug: 'certified-data-analyst' },
  { label: '🎬 YouTuber', slug: 'youtuber' },
  { label: '🚀 Startup Founder', slug: 'startup-founder' },
  { label: '💪 Fitness Trainer', slug: 'fitness-trainer' },
]

export default async function HomePage() {
  const [professions, featured, stats] = await Promise.all([
    getAllProfessions(),
    getFeaturedProfessions(),
    getSiteStats(),
  ])

  const searchData = professions.map(p => ({
    name: p.name, slug: p.slug, category: p.category, description: p.description
  }))

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-gradient-to-b from-orange-50 to-[#fafaf8] pt-20 pb-14 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-orange-200 text-accent
                        px-4 py-1.5 rounded-full text-xs font-bold mb-6">
          ⚡ {stats.professions.toLocaleString()}+ stacks live now
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-6xl leading-tight mb-5">
          The Complete <span className="text-accent">Stack</span><br />
          for Every Type of Person
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Find the exact tools, apps, and resources used by people in your profession —
          curated, rated, and verified by the community.
        </p>

        {/* Search */}
        <SearchBar professions={searchData} />

        {/* Quick hints */}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {HINTS.map(h => (
            <Link
              key={h.slug}
              href={`/stack/${h.slug}`}
              className="bg-white border border-gray-200 text-gray-500 px-3 py-1.5 rounded-full
                         text-xs hover:border-accent hover:text-accent transition-all"
            >
              {h.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="bg-primary py-6 px-4">
        <div className="max-w-3xl mx-auto flex justify-around flex-wrap gap-4">
          {[
            { num: stats.professions.toLocaleString() + '+', label: 'Stacks Available' },
            { num: stats.tools.toLocaleString() + '+', label: 'Tools Listed' },
            { num: stats.users.toLocaleString() + '+', label: 'Monthly Users' },
            { num: '₹0', label: 'Always Free' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-display font-extrabold text-2xl text-accent">{s.num}</div>
              <div className="text-gray-500 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl">Browse by Category</h2>
          <Link href="/category" className="text-accent text-sm font-medium hover:underline">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-white border border-gray-200 rounded-2xl p-4 text-center
                         hover:border-accent hover:shadow-sm transition-all group"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="font-display font-semibold text-sm mb-1 group-hover:text-accent transition-colors">
                {cat.name}
              </div>
              <div className="text-xs text-gray-400">{cat.count} stacks</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED STACKS ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl">🔥 Trending Stacks</h2>
          <Link href="/category" className="text-accent text-sm font-medium hover:underline">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map(prof => (
            <Link
              key={prof.slug}
              href={`/stack/${prof.slug}`}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-accent
                         hover:shadow-md transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">
                  {prof.category === 'Creative' ? '🎨' :
                   prof.category === 'Finance' ? '📊' :
                   prof.category === 'Tech' ? '💻' :
                   prof.category === 'Business' ? '🚀' :
                   prof.category === 'Creator' ? '🎬' :
                   prof.category === 'Health' ? '💪' : '⭐'}
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-primary group-hover:text-accent transition-colors">
                    {prof.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {prof.category} • {prof.india_specific ? '🇮🇳 India + Global' : '🌍 Global'}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                {prof.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  <strong className="text-primary">{prof.user_count.toLocaleString()}</strong> people use this
                </span>
                <span className="text-accent text-xs font-semibold">View Stack →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-primary py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-white text-center mb-10">
            How UpgradeStacks Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: '01', title: 'Find Your Stack', desc: 'Search your profession or goal. Land on a page built for exactly who you are.' },
              { num: '02', title: 'Explore Tools', desc: 'Every tool is rated, priced, and explained. See what\'s free, what\'s worth paying for.' },
              { num: '03', title: 'Save & Customize', desc: 'Build your personal stack. Add or remove tools. Track your upgrade journey.' },
              { num: '04', title: 'Share With Others', desc: 'Get a shareable link. Share your stack with colleagues, students, or followers.' },
            ].map(step => (
              <div key={step.num} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="font-display font-extrabold text-3xl text-accent mb-2">{step.num}</div>
                <h3 className="font-display font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
