// app/u/[username]/page.tsx
// Public profile page — every user gets /u/their-username
// Shareable like Linktree but for professional stacks

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createServerClient } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600 // refresh every hour

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio, username')
    .eq('username', params.username)
    .single()

  if (!profile) return { title: 'User Not Found' }

  return {
    title: `${profile.display_name}'s Stack — UpgradeStacks`,
    description: profile.bio || `See what ${profile.display_name} uses — their personal stack on UpgradeStacks.`,
    openGraph: {
      title: `${profile.display_name}'s Stack`,
      description: profile.bio || `Check out ${profile.display_name}'s professional stack.`,
    },
  }
}

export default async function UserProfilePage({ params }: Props) {
  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  // Get their saved stacks
  const { data: savedStacks } = await supabase
    .from('saved_stacks')
    .select(`
      saved_at,
      profession:profession_slug (
        name, slug, category, description, user_count, india_specific
      )
    `)
    .eq('user_id', profile.id)
    .order('saved_at', { ascending: false })

  const initials = (profile.display_name || profile.username || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const categoryIcons: Record<string, string> = {
    Creative: '🎨', Tech: '💻', Finance: '📊', Business: '🚀',
    Creator: '🎬', Health: '💪', Education: '📚', Marketing: '📢',
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Profile header */}
        <div className="text-center mb-10">
          {/* Avatar */}
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-accent flex items-center justify-center
                            text-white font-display font-extrabold text-2xl border-4 border-white shadow-md">
              {initials}
            </div>
          )}

          <h1 className="font-display font-extrabold text-2xl mb-1">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-gray-400 text-sm mb-3">@{profile.username}</p>

          {profile.bio && (
            <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed mb-4">
              {profile.bio}
            </p>
          )}

          {/* Share own profile */}
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200
                          px-4 py-2 rounded-full text-sm text-accent">
            🔗 upgradestacks.com/u/{params.username}
          </div>
        </div>

        {/* Saved stacks */}
        <div>
          <h2 className="font-display font-bold text-lg mb-4">
            {profile.display_name?.split(' ')[0]}'s Stacks
            <span className="text-gray-400 text-sm font-normal ml-2">
              ({savedStacks?.length || 0} saved)
            </span>
          </h2>

          {(!savedStacks || savedStacks.length === 0) ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <div className="text-3xl mb-3">📭</div>
              <p className="text-gray-400 text-sm">No stacks saved yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedStacks.map((item: any) => {
                const prof = item.profession
                if (!prof) return null
                return (
                  <Link
                    key={prof.slug}
                    href={`/stack/${prof.slug}`}
                    className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl
                               p-4 hover:border-accent hover:shadow-sm transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl flex-shrink-0">
                      {categoryIcons[prof.category] || '⭐'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm group-hover:text-accent transition-colors">
                        {prof.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {prof.category} • {prof.user_count?.toLocaleString()} users
                      </div>
                    </div>
                    <span className="text-accent text-xs font-semibold">View →</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* CTA for visitors */}
        <div className="mt-12 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100
                        rounded-2xl p-6 text-center">
          <p className="font-display font-bold text-base mb-2">Build your own stack</p>
          <p className="text-gray-500 text-sm mb-4">
            Create your free profile and share your professional stack
          </p>
          <Link
            href="/login"
            className="bg-accent text-white px-6 py-2.5 rounded-full text-sm font-semibold
                       hover:opacity-90 transition-opacity inline-block"
          >
            Get Started Free →
          </Link>
        </div>

      </div>
      <Footer />
    </>
  )
}
