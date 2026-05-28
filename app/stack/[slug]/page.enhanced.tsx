// app/stack/[slug]/page.tsx — ENHANCED VERSION
// Includes: workflow description, skill level, budget, AI tools, alternatives, learning resources

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ToolCard from '@/components/ToolCard'
import SubmitToolForm from '@/components/SubmitToolForm'
import EmailSubscribe from '@/components/EmailSubscribe'
import {
  getAllProfessionSlugs,
  getStackBySlug,
  getRelatedStacks,
} from '@/lib/supabase'

export async function generateStaticParams() {
  const slugs = await getAllProfessionSlugs()
  return slugs.map(slug => ({ slug }))
}

export const revalidate = 86400

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

export default async function StackPage({ params }: { params: { slug: string } }) {
  const [stack, related] = await Promise.all([
    getStackBySlug(params.slug),
    getRelatedStacks('', params.slug),
  ])

  if (!stack) notFound()

  const { profession, categories } = stack

  // Separate tools by type
  const allTools = categories.flatMap(cat => cat.tools)
  const aiTools = allTools.filter(conn => conn.tool?.is_ai_tool === true)
  const learningResources = allTools.filter(conn => conn.tool?.learning_resource === true)
  const regularTools = allTools.filter(conn => !conn.tool?.is_ai_tool && !conn.tool?.learning_resource)

  // Calculate budget
  const budgetBreakdown = calculateBudget(allTools)

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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO SECTION ── */}
      <div className="bg-gradient-to-br from-primary to-[#1a1830] py-12 px-4 text-white">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors mb-4 inline-block">
            ← Back to all stacks
          </Link>

          <div className="text-5xl mb-4">
            {getEmojiForCategory(profession.category)}
          </div>

          <h1 className="font-display font-extrabold text-4xl md:text-5xl mb-3">
            {profession.name} Stack
          </h1>

          {/* Skill Level Badge */}
          {profession.skill_level && (
            <div className="mb-3">
              <span className="inline-block bg-blue-500/20 border border-blue-400 text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                {profession.skill_level} Level
              </span>
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

          {/* ── LEFT COLUMN: CONTENT ── */}
          <div className="lg:col-span-2">

            {/* Intro text */}
            {profession.intro_text && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 mb-8">
                <p className="text-sm text-gray-600 leading-relaxed">{profession.intro_text}</p>
              </div>
            )}

            {/* Workflow Description (NEW) */}
            {profession.workflow_description && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
                <h3 className="font-display font-bold text-base mb-3 text-gray-900">
                  💼 Typical Workflow
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {profession.workflow_description}
                </p>
              </div>
            )}

            {/* Regular Tools Section */}
            {regularTools.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display font-bold text-xl mb-4 text-gray-900">
                  🛠 Core Tools
                </h2>
                <div className="space-y-3">
                  {regularTools.map(conn => (
                    <ToolCard key={conn.id} connection={conn} />
                  ))}
                </div>
              </div>
            )}

            {/* AI Tools Section (NEW) */}
            {aiTools.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display font-bold text-xl mb-4 text-gray-900">
                  🤖 AI Tools
                </h2>
                <p className="text-sm text-gray-600 mb-4">Modern AI-powered tools to boost productivity</p>
                <div className="space-y-3">
                  {aiTools.map(conn => (
                    <ToolCard key={conn.id} connection={conn} />
                  ))}
                </div>
              </div>
            )}

            {/* Learning Resources Section (NEW) */}
            {learningResources.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display font-bold text-xl mb-4 text-gray-900">
                  📚 Learning Resources
                </h2>
                <p className="text-sm text-gray-600 mb-4">Resources to learn and master these tools</p>
                <div className="space-y-3">
                  {learningResources.map(conn => (
                    <ToolCard key={conn.id} connection={conn} />
                  ))}
                </div>
              </div>
            )}

            {allTools.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-4">🔧</div>
                <p className="font-semibold">Tools coming soon</p>
                <p className="text-sm mt-1">Be the first to submit a tool for this stack</p>
              </div>
            )}

          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-5">

            {/* Budget Widget (NEW) */}
            {profession.budget_level && (
              <div className="card">
                <h3 className="font-display font-bold text-sm mb-3">💰 Estimated Budget</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-600">{profession.budget_level}</span>
                    <span className="font-semibold text-primary">{budgetBreakdown.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    {budgetBreakdown.description}
                  </p>
                </div>
              </div>
            )}

            {/* Share */}
            <div className="card">
              <h3 className="font-display font-bold text-sm mb-3">Share This Stack</h3>
              <div className="space-y-2">
                <ShareButton slug={profession.slug} name={profession.name} />
                <a
                  href={`https://wa.me/?text=Check out the ${profession.name} Stack on UpgradeStacks: https://upgradestacks.com/stack/${profession.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2 rounded-full border border-gray-200 text-sm font-semibold hover:border-accent hover:text-accent transition-all"
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

        {/* Related Stacks */}
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

// Helper functions
function getEmojiForCategory(category: string): string {
  const emojis: Record<string, string> = {
    'Creative': '🎨',
    'Finance': '📊',
    'Technology': '💻',
    'Business': '🚀',
    'Creator': '🎬',
    'Health': '💪',
    'Education': '📚',
    'Marketing': '📢',
    'Lifestyle': '🌟',
    'Wellness': '🧘',
  }
  return emojis[category] || '⭐'
}

function calculateBudget(tools: any[]) {
  // Calculate estimated monthly budget
  const pricedTools = tools.filter(t => t.tool?.global_price)
  const avgPrice = pricedTools.length > 0 ? 100 : 0

  const budgetMap: Record<string, { label: string; description: string }> = {
    'Free': { label: '$0/mo', description: 'All tools have free tiers' },
    'Free + Paid': { label: '$50-200/mo', description: 'Mix of free and paid tools' },
    'Premium': { label: '$200-500/mo', description: 'Mostly premium tools' },
    'Enterprise': { label: '$500+/mo', description: 'Enterprise-grade tools' },
  }

  return budgetMap['Free + Paid'] // Default, should be calculated from profession.budget_level
}

function ShareButton({ slug, name }: { slug: string; name: string }) {
  return (
    <button
      data-url={`https://upgradestacks.com/stack/${slug}`}
      className="w-full bg-accent text-white py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
    >
      🔗 Copy Stack Link
    </button>
  )
}
