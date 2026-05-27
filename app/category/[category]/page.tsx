// app/category/[category]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getProfessionsByCategory, getAllCategories } from '@/lib/supabase'

export const revalidate = 86400

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map(cat => ({
    category: cat.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, 'and')
  }))
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const name = params.category
    .replace(/-/g, ' ')
    .replace(/\band\b/gi, '&')
    .replace(/\b\w/g, c => c.toUpperCase())
  return {
    title: `${name} Stacks — Best Tools for ${name} Professionals`,
    description: `Browse all ${name} profession stacks on UpgradeStacks. Find curated tools, apps, and resources.`,
  }
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  // Convert URL slug back to category name
  const categoryName = params.category
    .replace(/-/g, ' ')
    .replace(/\band\b/gi, '&')
    .replace(/\b\w/g, c => c.toUpperCase())
  const professions = await getProfessionsByCategory(categoryName)

  if (professions.length === 0) notFound()

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors mb-4 inline-block">
          ← Home
        </Link>
        <h1 className="font-display font-extrabold text-4xl mb-2">{categoryName} Stacks</h1>
        <p className="text-gray-500 mb-8">{professions.length} stacks in this category</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {professions.map(prof => (
            <Link
              key={prof.slug}
              href={`/stack/${prof.slug}`}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-accent
                         hover:shadow-md transition-all"
            >
              <div className="font-display font-bold text-base mb-1">{prof.name}</div>
              <div className="text-xs text-gray-400 mb-2">
                {prof.india_specific ? '🇮🇳 India + Global' : '🌍 Global'}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                {prof.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  <strong className="text-primary">{prof.user_count.toLocaleString()}</strong> users
                </span>
                <span className="text-accent text-xs font-semibold">View →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}
