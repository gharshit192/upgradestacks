// lib/emoji-map.ts
// Centralized emoji mapping for categories and professions

export const CATEGORY_EMOJIS: Record<string, string> = {
  Creative: '🎨',
  Tech: '💻',
  Finance: '📊',
  Business: '💼',
  Health: '💪',
  Education: '📚',
  Lifestyle: '🏠',
  Marketing: '📢',
  Creator: '🎬',
}

export const PROFESSION_EMOJIS: Record<string, string> = {
  'chartered-accountant': '📊',
  'software-engineer': '💻',
  'data-analyst': '📈',
  'startup-founder': '🚀',
  'youtuber': '🎬',
  'fitness-trainer': '💪',
  'financial-analyst': '📈',
  'stock-trader': '📈',
  'accountant': '🧮',
}

export function getEmojiForCategory(category: string): string {
  return CATEGORY_EMOJIS[category] || '⭐'
}

export function getEmojiForProfession(slug: string, category: string): string {
  return PROFESSION_EMOJIS[slug] || getEmojiForCategory(category)
}
