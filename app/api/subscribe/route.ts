// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, profession_slug } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Upsert — don't error if email already exists
    const { error } = await supabaseAdmin
      .from('email_subscribers')
      .upsert(
        { email, profession_slug },
        { onConflict: 'email', ignoreDuplicates: true }
      )

    if (error) {
      console.error('subscribe insert error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('subscribe error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
