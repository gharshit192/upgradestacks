// lib/community.ts
// All community feature DB calls: views, saves, ratings, shares

import { supabase, supabaseAdmin } from './supabase'

// ── VIEW TRACKING ─────────────────────────────────────────────────────

/**
 * Record a page view — called from client on mount
 * Uses IP hash for deduplication
 */
export async function recordView(professionSlug: string) {
  await supabase.rpc('increment_view_count', {
    p_slug: professionSlug,
  })
}

/**
 * Get total view count for a profession
 */
export async function getViewCount(professionSlug: string): Promise<number> {
  const { count } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('profession_slug', professionSlug)
  return count || 0
}

/**
 * Get view stats for last 30 days (for dashboard)
 */
export async function getViewStats(professionSlug: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data } = await supabase
    .from('page_views')
    .select('viewed_at')
    .eq('profession_slug', professionSlug)
    .gte('viewed_at', thirtyDaysAgo.toISOString())

  return data || []
}


// ── SAVE STACKS ───────────────────────────────────────────────────────

/**
 * Save a stack for a logged-in user
 */
export async function saveStack(userId: string, professionSlug: string): Promise<boolean> {
  const { error } = await supabase
    .from('saved_stacks')
    .upsert({ user_id: userId, profession_slug: professionSlug }, { ignoreDuplicates: true })
  return !error
}

/**
 * Unsave a stack
 */
export async function unsaveStack(userId: string, professionSlug: string): Promise<boolean> {
  const { error } = await supabase
    .from('saved_stacks')
    .delete()
    .eq('user_id', userId)
    .eq('profession_slug', professionSlug)
  return !error
}

/**
 * Check if a user has saved a specific stack
 */
export async function isStackSaved(userId: string, professionSlug: string): Promise<boolean> {
  const { data } = await supabase
    .from('saved_stacks')
    .select('id')
    .eq('user_id', userId)
    .eq('profession_slug', professionSlug)
    .single()
  return !!data
}

/**
 * Get all saved stacks for a user
 */
export async function getUserSavedStacks(userId: string) {
  const { data } = await supabase
    .from('saved_stacks')
    .select(`
      saved_at,
      profession:profession_slug (
        name, slug, category, description, user_count, rating, india_specific
      )
    `)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })
  return data || []
}

/**
 * Get count of how many users saved a stack
 */
export async function getSaveCount(professionSlug: string): Promise<number> {
  const { count } = await supabase
    .from('saved_stacks')
    .select('*', { count: 'exact', head: true })
    .eq('profession_slug', professionSlug)
  return count || 0
}


// ── SAVE INDIVIDUAL TOOLS ─────────────────────────────────────────────

/**
 * Toggle save/unsave a tool in a stack
 */
export async function toggleSaveTool(
  userId: string,
  professionSlug: string,
  toolId: string
): Promise<'saved' | 'unsaved'> {
  const { data } = await supabase
    .from('saved_tools')
    .select('id')
    .eq('user_id', userId)
    .eq('profession_slug', professionSlug)
    .eq('tool_id', toolId)
    .single()

  if (data) {
    await supabase.from('saved_tools').delete().eq('id', data.id)
    return 'unsaved'
  } else {
    await supabase.from('saved_tools').insert({ user_id: userId, profession_slug: professionSlug, tool_id: toolId })
    return 'saved'
  }
}

/**
 * Get all tool IDs a user has saved for a stack
 */
export async function getUserSavedToolIds(userId: string, professionSlug: string): Promise<string[]> {
  const { data } = await supabase
    .from('saved_tools')
    .select('tool_id')
    .eq('user_id', userId)
    .eq('profession_slug', professionSlug)
  return (data || []).map(d => d.tool_id)
}


// ── COMMUNITY RATINGS ─────────────────────────────────────────────────

/**
 * Submit or update a tool rating
 */
export async function rateToolInStack(
  userId: string,
  professionSlug: string,
  toolId: string,
  rating: number,
  review?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('tool_ratings')
    .upsert({
      user_id: userId,
      profession_slug: professionSlug,
      tool_id: toolId,
      rating,
      review: review || null,
    }, { onConflict: 'user_id,profession_slug,tool_id' })
  return !error
}

/**
 * Get rating summary for all tools in a stack
 */
export async function getStackRatings(professionSlug: string): Promise<Record<string, { avg: number; count: number }>> {
  const { data } = await supabase
    .from('tool_rating_summary')
    .select('*')
    .eq('profession_slug', professionSlug)

  const result: Record<string, { avg: number; count: number }> = {}
  for (const row of (data || [])) {
    result[row.tool_id] = { avg: row.avg_rating, count: row.total_ratings }
  }
  return result
}

/**
 * Get all reviews for a tool in a stack
 */
export async function getToolReviews(professionSlug: string, toolId: string) {
  const { data } = await supabase
    .from('tool_ratings')
    .select(`
      rating, review, rated_at,
      profile:user_id (display_name, avatar_url, username)
    `)
    .eq('profession_slug', professionSlug)
    .eq('tool_id', toolId)
    .not('review', 'is', null)
    .order('rated_at', { ascending: false })
    .limit(10)
  return data || []
}

/**
 * Get a user's existing rating for a tool
 */
export async function getUserRating(
  userId: string,
  professionSlug: string,
  toolId: string
): Promise<number | null> {
  const { data } = await supabase
    .from('tool_ratings')
    .select('rating')
    .eq('user_id', userId)
    .eq('profession_slug', professionSlug)
    .eq('tool_id', toolId)
    .single()
  return data?.rating || null
}


// ── SHARE TRACKING ────────────────────────────────────────────────────

/**
 * Record a share event
 */
export async function recordShare(
  professionSlug: string,
  platform: 'copy' | 'whatsapp' | 'twitter' | 'linkedin',
  userId?: string
): Promise<void> {
  await supabase
    .from('share_events')
    .insert({
      profession_slug: professionSlug,
      platform,
      user_id: userId || null,
    })
}

/**
 * Get share count for a profession
 */
export async function getShareCount(professionSlug: string): Promise<number> {
  const { count } = await supabase
    .from('share_events')
    .select('*', { count: 'exact', head: true })
    .eq('profession_slug', professionSlug)
  return count || 0
}


// ── TOOL VOTES ────────────────────────────────────────────────────────

/**
 * Vote a tool up or down
 */
export async function voteTool(
  professionSlug: string,
  toolId: string,
  vote: 'up' | 'down',
  userId?: string
): Promise<void> {
  await supabase
    .from('tool_votes')
    .upsert({
      user_id: userId || null,
      tool_id: toolId,
      profession_slug: professionSlug,
      vote,
    }, { onConflict: 'user_id,tool_id,profession_slug', ignoreDuplicates: false })
}

/**
 * Get vote counts for all tools in a stack
 */
export async function getStackVotes(
  professionSlug: string
): Promise<Record<string, { up: number; down: number }>> {
  const { data } = await supabase
    .from('tool_votes')
    .select('tool_id, vote')
    .eq('profession_slug', professionSlug)

  const result: Record<string, { up: number; down: number }> = {}
  for (const row of (data || [])) {
    if (!result[row.tool_id]) result[row.tool_id] = { up: 0, down: 0 }
    result[row.tool_id][row.vote as 'up' | 'down']++
  }
  return result
}
