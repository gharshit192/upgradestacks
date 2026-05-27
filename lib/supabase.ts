// lib/supabase.ts
// ALL database calls live here. One place. Easy to update.

import { createClient } from '@supabase/supabase-js'
import type { Profession, Tool, StackConnection, StackWithTools } from './types'

// ── Client ──────────────────────────────────────────────────────────
// These values come from your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Server-side client with service role key (for API routes that write data)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


// ── PROFESSIONS ──────────────────────────────────────────────────────

/**
 * Get all live professions (used for sitemap + homepage)
 */
export async function getAllProfessions(): Promise<Profession[]> {
  const { data, error } = await supabase
    .from('professions')
    .select('*')
    .eq('status', 'live')
    .order('user_count', { ascending: false })

  if (error) {
    console.error('getAllProfessions error:', error)
    return []
  }
  return data || []
}

/**
 * Get all slugs for generateStaticParams
 * Only fetches slug column — fast and lightweight
 */
export async function getAllProfessionSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('professions')
    .select('slug')
    .eq('status', 'live')

  if (error) {
    console.error('getAllProfessionSlugs error:', error)
    return []
  }
  return (data || []).map(p => p.slug)
}

/**
 * Get a single profession by slug
 */
export async function getProfessionBySlug(slug: string): Promise<Profession | null> {
  const { data, error } = await supabase
    .from('professions')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'live')
    .single()

  if (error) {
    console.error(`getProfessionBySlug(${slug}) error:`, error)
    return null
  }
  return data
}

/**
 * Get featured professions for homepage (top 6 by user_count)
 */
export async function getFeaturedProfessions(): Promise<Profession[]> {
  const { data, error } = await supabase
    .from('professions')
    .select('*')
    .eq('status', 'live')
    .order('user_count', { ascending: false })
    .limit(6)

  if (error) {
    console.error('getFeaturedProfessions error:', error)
    return []
  }
  return data || []
}

/**
 * Get professions by category
 */
export async function getProfessionsByCategory(category: string): Promise<Profession[]> {
  const { data, error } = await supabase
    .from('professions')
    .select('*')
    .eq('status', 'live')
    .eq('category', category)
    .order('user_count', { ascending: false })

  if (error) {
    console.error(`getProfessionsByCategory(${category}) error:`, error)
    return []
  }
  return data || []
}

/**
 * Get all unique categories
 */
export async function getAllCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('professions')
    .select('category')
    .eq('status', 'live')

  if (error) return []
  const cats = (data || []).map(p => p.category)
  return [...new Set(cats)].sort()
}


// ── TOOLS ────────────────────────────────────────────────────────────

/**
 * Get all tools (used for tool pages)
 */
export async function getAllTools(): Promise<Tool[]> {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .order('name')

  if (error) {
    console.error('getAllTools error:', error)
    return []
  }
  return data || []
}

/**
 * Get a single tool by slug
 */
export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}


// ── STACK CONNECTIONS ─────────────────────────────────────────────────

/**
 * Get the full stack for a profession — profession + all tools grouped by category
 * This is the CORE function that builds each stack page
 */
export async function getStackBySlug(slug: string): Promise<StackWithTools | null> {
  // 1. Get the profession
  const profession = await getProfessionBySlug(slug)
  if (!profession) return null

  // 2. Get all connections for this profession, joined with tool data
  const { data: connections, error } = await supabase
    .from('stack_connections')
    .select(`
      *,
      tool:tool_id (*)
    `)
    .eq('profession_slug', slug)
    .eq('active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error(`getStackBySlug(${slug}) connections error:`, error)
    return { profession, categories: [] }
  }

  // 3. Group tools by display_category
  const categoryMap = new Map<string, (StackConnection & { tool: Tool })[]>()

  for (const conn of (connections || [])) {
    if (!conn.tool) continue
    const cat = conn.display_category
    if (!categoryMap.has(cat)) categoryMap.set(cat, [])
    categoryMap.get(cat)!.push(conn as StackConnection & { tool: Tool })
  }

  // 4. Convert map to sorted array
  const categories = Array.from(categoryMap.entries()).map(([label, tools]) => ({
    label,
    tools: tools.sort((a, b) => a.display_order - b.display_order),
  }))

  return { profession, categories }
}

/**
 * Get related stacks (same category, different slug)
 */
export async function getRelatedStacks(category: string, currentSlug: string): Promise<Profession[]> {
  const { data, error } = await supabase
    .from('professions')
    .select('*')
    .eq('status', 'live')
    .eq('category', category)
    .neq('slug', currentSlug)
    .order('user_count', { ascending: false })
    .limit(3)

  if (error) return []
  return data || []
}


// ── STATS ─────────────────────────────────────────────────────────────

/**
 * Get site-wide stats for homepage
 */
export async function getSiteStats(): Promise<{ professions: number; tools: number; users: number }> {
  const [{ count: professions }, { count: tools }, usersResult] = await Promise.all([
    supabase.from('professions').select('*', { count: 'exact', head: true }).eq('status', 'live'),
    supabase.from('tools').select('*', { count: 'exact', head: true }),
    supabase.from('professions').select('user_count').eq('status', 'live'),
  ])

  const users = (usersResult.data || []).reduce((sum, p) => sum + (p.user_count || 0), 0)

  return {
    professions: professions || 0,
    tools: tools || 0,
    users,
  }
}
