// app/auth/callback/route.ts
// Supabase Auth redirects here after Google login or magic link click

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/'

  if (code) {
    const supabase = createServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to the page they were trying to access
  return NextResponse.redirect(`${origin}${redirect}`)
}
