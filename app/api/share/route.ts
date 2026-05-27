// app/api/share/route.ts
// Track share events for analytics
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { profession_slug, platform } = await req.json()
    if (!profession_slug || !platform) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    await supabaseAdmin
      .from('share_events')
      .insert({ profession_slug, platform })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
