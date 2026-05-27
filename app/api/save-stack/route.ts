// app/api/save-stack/route.ts
// Save or unsave a stack for a logged-in user
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const { profession_slug, action } = await req.json()
    // action: 'save' | 'unsave'

    if (action === 'unsave') {
      await supabase
        .from('saved_stacks')
        .delete()
        .eq('user_id', user.id)
        .eq('profession_slug', profession_slug)
      return NextResponse.json({ saved: false })
    }

    await supabase
      .from('saved_stacks')
      .upsert({ user_id: user.id, profession_slug }, { ignoreDuplicates: true })

    return NextResponse.json({ saved: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// GET: check if current user saved a stack
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ saved: false })

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ saved: false })

  const { data } = await supabase
    .from('saved_stacks')
    .select('id')
    .eq('user_id', user.id)
    .eq('profession_slug', slug)
    .single()

  return NextResponse.json({ saved: !!data })
}
