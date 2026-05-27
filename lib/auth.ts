// lib/auth.ts
// Supabase Auth helpers — client-side only (for 'use client' components)

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Client-side Supabase (use in 'use client' components)
export const createClient = () => createClientComponentClient()

// Server-side functions are in lib/auth.server.ts
export { createServerClient, getSession, getCurrentUser } from './auth.server'
