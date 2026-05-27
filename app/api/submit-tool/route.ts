// app/api/submit-tool/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { profession_slug, tool_name, tool_url, category, reason, submitter_email } = body

    // Basic validation
    if (!profession_slug || !tool_name || !reason || reason.length < 20) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('tool_submissions')
      .insert({
        profession_slug,
        tool_name,
        tool_url: tool_url || null,
        category: category || null,
        reason,
        submitter_email: submitter_email || null,
        status: 'pending',
      })

    if (error) {
      console.error('submit-tool insert error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('submit-tool error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
