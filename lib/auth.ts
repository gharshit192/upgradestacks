// lib/auth.ts
// Supabase Auth helpers — login, logout, get session

import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Client-side Supabase (use in 'use client' components)
export const createClient = () => createClientComponentClient()

// Server-side Supabase (use in Server Components & API routes)
export const createServerClient = () =>
  createServerComponentClient({ cookies })

// Get current user session (server-side)
export async function getSession() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Get current user profile
export async function getCurrentUser() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { ...user, profile }
}
