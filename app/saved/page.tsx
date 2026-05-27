// app/saved/page.tsx
// User's saved stacks dashboard — requires login

import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export const metadata = {
  title: 'My Saved Stacks — UpgradeStacks',
}

export default async function SavedPage() {
  const user = await getCurrentUser()

  // Not logged in — redirect to login
  if (!user) redirect('/login?redirect=/saved')

  // Get saved stacks
  const { data: savedStacks } = await supabase
    .from('saved_stacks')
    .select(`
      saved_at,
      profession:profession_slug (
        name, slug, category, description, user_count, india_specific, rating
      )
    `)
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  // Get their profile for share link
  const profile = user.profile

  const categoryIcons: Record<string, string> = {
    Creative: '🎨', Tech: '💻', Finance: '📊', Business: '🚀',
    Creator: '🎬', Health: '💪', Education: '📚', Marketing: '📢',
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display font-extrabold text-3xl mb-1">My Stacks</h1>
            <p className="text-gray-400 text-sm">
              {savedStacks?.length || 0} stacks saved
            </p>
          </div>

          {/* Share profile link */}
          {profile?.username && (
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Your public profile:</p>
              <Link
                href={`/u/${profile.username}`}
                className="text-accent text-sm font-semibold hover:underline"
              >
                upgradestacks.com/u/{profile.username} →
              </Link>
            </div>
          )}
        </div>

        {/* No stacks saved yet */}
        {(!savedStacks || savedStacks.length === 0) && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="font-display font-bold text-xl mb-2">No stacks saved yet</h2>
            <p className="text-gray-400 text-sm mb-6">
              Browse stacks and click "Save My Stack" to build your collection
            </p>
            <Link href="/" className="bg-accent text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
              Browse Stacks →
            </Link>
          </div>
        )}

        {/* Saved stacks grid */}
        {savedStacks && savedStacks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedStacks.map((item: any) => {
              const prof = item.profession
              if (!prof) return null
              return (
                <div key={prof.slug} className="bg-white border border-gray-200 rounded-2xl p-5
                                                hover:border-accent hover:shadow-md transition-all relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">
                      {categoryIcons[prof.category] || '⭐'}
                    </div>
                    <div>
                      <div className="font-display font-bold text-sm">{prof.name}</div>
                      <div className="text-xs text-gray-400">
                        {prof.india_specific ? '🇮🇳' : '🌍'} {prof.category}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                    {prof.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      ⭐ {prof.rating} • {prof.user_count?.toLocaleString()} users
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Link
                      href={`/stack/${prof.slug}`}
                      className="flex-1 bg-accent text-white py-2 rounded-full text-xs font-semibold
                                 text-center hover:opacity-90 transition-opacity"
                    >
                      View Stack
                    </Link>
                    <UnsaveButton slug={prof.slug} userId={user.id} />
                  </div>

                  <div className="absolute top-3 right-3 text-gray-200 text-xs">
                    Saved {new Date(item.saved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Profile settings prompt */}
        {!profile?.username && (
          <div className="mt-10 bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Set a username to get a shareable profile</p>
              <p className="text-xs text-gray-500">upgradestacks.com/u/your-name</p>
            </div>
            <Link href="/settings" className="text-accent text-sm font-semibold hover:underline">
              Set username →
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

// Client unsave button — inline for simplicity
function UnsaveButton({ slug, userId }: { slug: string; userId: string }) {
  'use client'
  return (
    <button
      className="px-3 py-2 border border-gray-200 rounded-full text-xs text-gray-400
                 hover:border-red-200 hover:text-red-400 transition-all"
      onClick={async () => {
        await fetch('/api/save-stack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profession_slug: slug, action: 'unsave' }),
        })
        window.location.reload()
      }}
    >
      ✕
    </button>
  )
}
