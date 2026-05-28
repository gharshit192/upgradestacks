// app/stack/[slug]/page.tsx
// THE CORE ENGINE — auto-generates one page per profession from database
// ONE FILE handles ALL 10,000+ profession pages

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ToolCard from '@/components/ToolCard'
import SubmitToolForm from '@/components/SubmitToolForm'
import EmailSubscribe from '@/components/EmailSubscribe'
import { ShareButton } from '@/components/ShareButton'
import {
  getAllProfessionSlugs,
  getStackBySlug,
  getRelatedStacks,
} from '@/lib/supabase'
import { getEmojiForProfession } from '@/lib/emoji-map'

// ── STATIC GENERATION ─────────────────────────────────────────────────
// Next.js calls this at build time to pre-build ALL stack pages
// Adding a profession to Supabase + triggering revalidation = new page live
export async function generateStaticParams() {
  const slugs = await getAllProfessionSlugs()
  return slugs.map(slug => ({ slug }))
}

// ISR: revalidate pages every 24 hours automatically
export const revalidate = 86400

// ── DYNAMIC METADATA ──────────────────────────────────────────────────
// Every page gets unique SEO title + description from database
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const stack = await getStackBySlug(params.slug)
  if (!stack) return { title: 'Stack Not Found' }

  const { profession } = stack

  return {
    title: profession.seo_title || `${profession.name} Stack — Best Tools & Apps 2026`,
    description: profession.seo_description || profession.description,
    openGraph: {
      title: profession.seo_title || profession.name,
      description: profession.seo_description || profession.description,
      type: 'website',
      url: `https://upgradestacks.com/stack/${profession.slug}`,
    },
    alternates: {
      canonical: `https://upgradestacks.com/stack/${profession.slug}`,
    },
  }
}

// ── PAGE COMPONENT ────────────────────────────────────────────────────
export default async function StackPage({ params }: { params: { slug: string } }) {
  // Fetch stack data — profession + all tools grouped by category
  const stack = await getStackBySlug(params.slug)

  // If profession not found → 404 page
  if (!stack) notFound()

  const { profession, categories } = stack

  // Fetch related stacks with correct category
  const related = await getRelatedStacks(profession.category, params.slug)

  // JSON-LD structured data for Google
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: profession.name + ' Stack',
    description: profession.description,
    url: `https://upgradestacks.com/stack/${profession.slug}`,
    numberOfItems: categories.reduce((sum, cat) => sum + cat.tools.length, 0),
    itemListElement: categories.flatMap((cat, catIdx) =>
      cat.tools.map((conn, toolIdx) => ({
        '@type': 'ListItem',
        position: catIdx * 100 + toolIdx + 1,
        name: conn.tool.name,
        url: conn.tool.website_url,
        description: conn.tool.short_desc,
      }))
    ),
  }

  return (
    <>
      <Navbar />

      {/* JSON-LD for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-primary to-[#1a1830] py-12 px-4 text-white">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors mb-4 inline-block">
            ← Back to all stacks
          </Link>

          <div className="text-5xl mb-4">
            {getEmojiForProfession(profession.slug, profession.category)}
          </div>

          <h1 className="font-display font-extrabold text-4xl md:text-5xl mb-3">
            {profession.name} Stack
          </h1>

          {/* Skill Level and Budget Level Badges */}
          {(profession.skill_level || profession.budget_level) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {profession.skill_level && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  profession.skill_level === 'Beginner' ? 'bg-green-500/20 text-green-300' :
                  profession.skill_level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {profession.skill_level === 'Beginner' ? '🟢' :
                   profession.skill_level === 'Intermediate' ? '🟡' : '🔴'}
                  {' '}{profession.skill_level}
                </div>
              )}
              {profession.budget_level && (
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
                  💰 {profession.budget_level}
                </div>
              )}
            </div>
          )}

          <p className="text-gray-300 max-w-2xl leading-relaxed mb-5">
            {profession.description}
          </p>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
              <strong>{profession.user_count.toLocaleString()}</strong> people use this
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
              ⭐ {profession.rating}/5 rating
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
              Updated {new Date(profession.updated_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </div>
            {profession.india_specific && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
                🇮🇳 India + Global
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── TOOLS ── */}
          <div className="lg:col-span-2">

            {/* Intro text */}
            {profession.intro_text && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 mb-8">
                <p className="text-sm text-gray-600 leading-relaxed">{profession.intro_text}</p>
              </div>
            )}

            {/* Tool categories */}
            {categories.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-4">🔧</div>
                <p className="font-semibold">Tools coming soon</p>
                <p className="text-sm mt-1">Be the first to submit a tool for this stack</p>
              </div>
            ) : (
              categories.map(cat => (
                <div key={cat.label} className="mb-8">
                  <h2 className="font-display font-bold text-base mb-3 text-gray-400 uppercase tracking-wide text-xs">
                    {cat.label}
                  </h2>
                  <div className="space-y-3">
                    {cat.tools.map(conn => (
                      <ToolCard key={conn.id} connection={conn} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div className="space-y-5">

            {/* Share */}
            <div className="card">
              <h3 className="font-display font-bold text-sm mb-3">Share This Stack</h3>
              <div className="space-y-2">
                <ShareButton slug={profession.slug} name={profession.name} />
                <a
                  href={`https://wa.me/?text=Check out the ${profession.name} Stack on UpgradeStacks: https://upgradestacks.com/stack/${profession.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2 rounded-full border border-gray-200
                             text-sm font-semibold hover:border-accent hover:text-accent transition-all"
                >
                  📤 Share on WhatsApp
                </a>
              </div>
            </div>

            {/* Ratings */}
            <div className="card">
              <h3 className="font-display font-bold text-sm mb-3">Community Ratings</h3>
              {[
                { label: 'Overall', stars: 5 },
                { label: 'Accuracy', stars: 4 },
                { label: 'Completeness', stars: 5 },
                { label: 'India Relevant', stars: 5 },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-none">
                  <span className="text-sm text-gray-500">{r.label}</span>
                  <span className="text-yellow-400 text-sm">
                    {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
                  </span>
                </div>
              ))}
            </div>

            {/* Submit tool */}
            <div className="card">
              <h3 className="font-display font-bold text-sm mb-1">🛠 Submit a Missing Tool</h3>
              <p className="text-xs text-gray-400 mb-3">Know a tool not listed here? Add it.</p>
              <SubmitToolForm professionSlug={profession.slug} />
            </div>

            {/* Email subscribe */}
            <div className="card">
              <h3 className="font-display font-bold text-sm mb-1">📬 Stack Updates</h3>
              <p className="text-xs text-gray-400 mb-3">
                Get notified when new tools are added to this stack.
              </p>
              <EmailSubscribe professionSlug={profession.slug} />
            </div>

          </div>
        </div>

        {/* ── RELATED STACKS ── */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display font-bold text-xl mb-5">Related Stacks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(rel => (
                <Link
                  key={rel.slug}
                  href={`/stack/${rel.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-accent transition-all"
                >
                  <div className="font-display font-bold text-sm text-primary mb-1">{rel.name}</div>
                  <div className="text-xs text-gray-400 mb-2">{rel.category}</div>
                  <div className="text-xs text-accent font-medium">View Stack →</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
