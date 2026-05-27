// app/api/rate/route.ts
// Submit or update a tool rating
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Login required to rate' }, { status: 401 })

    const { profession_slug, tool_id, rating, review } = await req.json()

    if (!profession_slug || !tool_id || !rating) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })
    }

    const { error } = await supabase
      .from('tool_ratings')
      .upsert({
        user_id: user.id,
        profession_slug,
        tool_id,
        rating,
        review: review || null,
      }, { onConflict: 'user_id,profession_slug,tool_id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// GET: fetch rating summary for a stack
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  const supabase = createServerClient()
  const { data } = await supabase
    .from('tool_rating_summary')
    .select('*')
    .eq('profession_slug', slug)

  const result: Record<string, { avg: number; count: number }> = {}
  for (const row of (data || [])) {
    result[row.tool_id] = { avg: Number(row.avg_rating), count: Number(row.total_ratings) }
  }
  return NextResponse.json(result)
}
