// app/api/revalidate/route.ts
// Supabase calls this webhook when database changes
// Next.js then refreshes the affected pages within 60 seconds

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  // Verify secret key — prevents unauthorized cache busting
  const secret = req.headers.get('x-revalidate-secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { type, slug } = body // type: 'profession' | 'tool' | 'all'

    if (type === 'profession' && slug) {
      // Revalidate specific stack page
      revalidatePath(`/stack/${slug}`)
      console.log(`Revalidated /stack/${slug}`)
    } else if (type === 'all') {
      // Revalidate everything (use sparingly)
      revalidatePath('/')
      revalidatePath('/stack/[slug]', 'page')
      revalidatePath('/category/[category]', 'page')
      console.log('Revalidated all pages')
    } else {
      // Default: revalidate homepage and all stacks
      revalidatePath('/')
      if (slug) revalidatePath(`/stack/${slug}`)
    }

    return NextResponse.json({ revalidated: true, timestamp: Date.now() })
  } catch (err) {
    console.error('revalidate error:', err)
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}
