// app/api/view/route.ts
// Records a page view — called from client on mount
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// In-memory rate limit (IP + slug, 1 count per hour)
const viewCache = new Map<string, number>()

export async function POST(req: NextRequest) {
  try {
    const { profession_slug } = await req.json()
    if (!profession_slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const cacheKey = `${ip}:${profession_slug}`
    const lastView = viewCache.get(cacheKey)
    const now = Date.now()

    // Rate limit: same IP + slug counts once per hour
    if (lastView && now - lastView < 3_600_000) {
      return NextResponse.json({ counted: false, reason: 'rate_limited' })
    }

    viewCache.set(cacheKey, now)
    if (viewCache.size > 10_000) viewCache.clear()

    await supabaseAdmin.rpc('increment_view_count', {
      p_slug: profession_slug,
      p_ip: ip,
    })

    return NextResponse.json({ counted: true })
  } catch (err) {
    console.error('view track error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
