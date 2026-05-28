// lib/types.ts
// All TypeScript types used across the project

export interface Profession {
  id: string
  profession_id: string
  name: string
  slug: string
  category: string
  sub_category: string
  description: string
  intro_text: string
  seo_title: string
  seo_description: string
  india_specific: boolean
  search_volume: string
  priority: string
  status: 'live' | 'draft' | 'planned'
  user_count: number
  rating: number
  created_at: string
  updated_at: string
  // Stack enrichment fields
  workflow_description?: string | null
  skill_level?: 'Beginner' | 'Intermediate' | 'Advanced' | null
  budget_level?: 'Free' | 'Free + Paid' | 'Premium' | 'Enterprise' | null
}

export interface Tool {
  id: string
  tool_id: string
  name: string
  slug: string
  website_url: string
  affiliate_url: string | null
  category: string
  short_desc: string
  long_desc: string
  pricing_type: 'Free' | 'Freemium' | 'Paid'
  has_free_plan: boolean
  india_price: string
  global_price: string
  india_available: boolean
  logo_emoji: string
  affiliate_commission: string | null
  verified: boolean
  rating: number
  created_at: string
  // Affiliate fields
  affiliate_link?: string | null
  affiliate_provider?: 'PartnerStack' | 'Impact' | 'Direct' | 'Amazon Associates' | 'Rakuten' | 'CJ Affiliate' | 'Other' | null
  commission_type?: 'Recurring' | 'One-time' | 'Variable' | null
  commission_percentage?: number | null
  affiliate_enabled?: boolean
  // Stack enrichment fields
  is_ai_tool?: boolean | null
  learning_resource?: boolean | null
}

export interface StackConnection {
  id: string
  profession_slug: string
  tool_id: string
  display_category: string
  importance: 'Essential' | 'Recommended' | 'Optional'
  display_order: number
  custom_desc: string | null
  cta_text: string
  show_price: boolean
  india_only: boolean
  active: boolean
  // Joined from tools table
  tool?: Tool
}

export interface StackWithTools {
  profession: Profession
  categories: {
    label: string
    tools: (StackConnection & { tool: Tool })[]
  }[]
}

export interface ToolSubmission {
  profession_slug: string
  tool_name: string
  tool_url: string
  category: string
  reason: string
  submitter_email?: string
}

export interface EmailSubscriber {
  email: string
  profession_slug: string
}

export interface ToolAlternative {
  id: string
  tool_id: string
  alternative_tool_id: string
  reason: string
  // Joined from tools table
  alternative_tool?: Tool
}
