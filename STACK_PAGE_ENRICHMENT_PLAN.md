# Stack Page Enrichment — Data Sources & Structure

## 📊 Data Flow Map

```
Database Tables → TypeScript Types → Query Functions → Page Component → UI
```

---

## Data Sources for Each New Section

### 1. **Workflow Description**
- **Source:** `professions.workflow_description` (TEXT)
- **Filled by:** Content editor (you, or AI-generated)
- **Example:** "A typical day starts with checking email and Slack for urgent items, then deep work for 4 hours using IDE + git. Afternoon: Code review + meetings. Tools: VS Code, GitHub, Slack."
- **Display:** Full-width section under intro text

### 2. **Skill Level**
- **Source:** `professions.skill_level` (Beginner/Intermediate/Advanced)
- **Filled by:** Content editor
- **Display:** Badge next to profession name in hero section

### 3. **Budget Level**
- **Source:** `professions.budget_level` (Free/Free+Paid/Premium/Enterprise)
- **Filled by:** Content editor
- **Display:** Sidebar widget with cost breakdown
- **Cost Breakdown:** Calculated from tools in this stack

### 4. **AI Tools Subsection**
- **Source:** `tools.is_ai_tool` (BOOLEAN, DEFAULT FALSE)
- **Filled by:** You flag which tools are AI (Cursor, Claude, ChatGPT, etc.)
- **Display:** Separate category section: "🤖 AI Tools" if any exist
- **Example Tools:** Cursor, ChatGPT Plus, Claude, GitHub Copilot, Gamma, AdCreative.ai

### 5. **Learning Resources**
- **Source:** `tools.learning_resource` (BOOLEAN, DEFAULT FALSE)
- **Filled by:** You flag which tools are learning resources (Udemy, YouTube, etc.)
- **Display:** Separate category section: "📚 Learning Resources" if any exist

### 6. **Alternatives Section**
- **Source:** `tool_alternatives` table (tool_id → alternative_tool_id + reason)
- **Filled by:** Manual data entry (e.g., "Figma alternative: Sketch because of cost")
- **Display:** Shows under each tool: "Also consider: [Alternative] — [reason]"

---

## Updated TypeScript Types

```typescript
// Updated Profession interface
export interface Profession {
  // ... existing fields ...
  workflow_description?: string      // New
  skill_level?: 'Beginner' | 'Intermediate' | 'Advanced' | null  // New
  budget_level?: 'Free' | 'Free + Paid' | 'Premium' | 'Enterprise' | null  // New
}

// Updated Tool interface
export interface Tool {
  // ... existing fields ...
  is_ai_tool?: boolean               // New
  learning_resource?: boolean        // New
}

// New type for alternatives
export interface ToolAlternative {
  tool_id: string
  alternative_tool_id: string
  alternative_tool: Tool             // Joined from tools table
  reason: string
}
```

---

## Database Queries Needed

### Query 1: Get Stack by Slug (UPDATED)
```typescript
// lib/supabase.ts
export async function getStackBySlug(slug: string) {
  const { data: profession } = await supabaseAdmin
    .from('professions')
    .select(`
      *,
      stack_connections (
        *,
        tool:tools (*)
      )
    `)
    .eq('slug', slug)
    .single()

  if (!profession) return null

  // Separate tools into categories
  // Filter AI tools and learning resources
  // Return structure includes new fields
}
```

### Query 2: Get Tool Alternatives
```typescript
export async function getToolAlternatives(toolId: string) {
  const { data } = await supabaseAdmin
    .from('tool_alternatives')
    .select(`
      tool_id,
      alternative_tool_id,
      reason,
      tool:tools(alternative_tool_id) (*)
    `)
    .eq('tool_id', toolId)

  return data
}
```

### Query 3: Get AI Tools in Stack
```typescript
// Get all tools in this stack that have is_ai_tool = true
const aiTools = categories
  .flatMap(cat => cat.tools)
  .filter(tool => tool.tool.is_ai_tool === true)
```

### Query 4: Get Learning Resources in Stack
```typescript
const learningResources = categories
  .flatMap(cat => cat.tools)
  .filter(tool => tool.tool.learning_resource === true)
```

---

## UI Layout for Enhanced Stack Page

```
┌─────────────────────────────────────────────┐
│ HERO SECTION (Updated)                      │
│ - Profession name                           │
│ - 🏷️ Skill Level badge (NEW)                │
│ - Description                               │
│ - Metadata (user count, rating, updated)    │
└─────────────────────────────────────────────┘

┌────────────────────────────┬────────────────┐
│ LEFT COLUMN (Tools)        │ RIGHT SIDEBAR  │
├────────────────────────────┤                │
│ 📋 INTRO TEXT              │ 📤 Share       │
│                            │ ⭐ Ratings     │
│ 💼 WORKFLOW DESCRIPTION    │ 🛠 Submit Tool │
│ (NEW)                      │ 📬 Subscribe   │
│ "A typical day involves..." │ 💰 Budget     │
│                            │ (NEW)          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━   │                │
│                            │                │
│ 🛠 CORE TOOLS              │                │
│ - Tool 1 Card              │                │
│ - Tool 2 Card              │                │
│ - Tool 3 Card              │                │
│                            │                │
│ 🤖 AI TOOLS (NEW)          │                │
│ - Cursor Card              │                │
│ - Claude Card              │                │
│                            │                │
│ 📚 LEARNING RESOURCES      │                │
│ (NEW)                      │                │
│ - Udemy Card               │                │
│ - YouTube Card             │                │
│                            │                │
│ 🔄 ALTERNATIVES (NEW)      │                │
│ Tool 1: Also consider X    │                │
│ Tool 2: Also consider Y    │                │
│                            │                │
└────────────────────────────┴────────────────┘

┌─────────────────────────────────────────────┐
│ RELATED STACKS SECTION                      │
└─────────────────────────────────────────────┘
```

---

## What Each Field Shows

| Field | Shows What | Example |
|-------|-----------|---------|
| `workflow_description` | A typical day/workflow | "Morning: Email + Slack. 9-1pm: Deep coding. 1-5pm: Code review + meetings." |
| `skill_level` | Who this is for | Beginner, Intermediate, Advanced |
| `budget_level` | Estimated monthly cost | Free ($0), Free + Paid ($50-200), Premium ($200-500), Enterprise (Custom) |
| `is_ai_tool` | Marks modern AI tools | Cursor, Claude, ChatGPT Plus, Gamma |
| `learning_resource` | Educational tools | Udemy, LinkedIn Learning, YouTube, Dev.to |
| `tool_alternatives` | Comparable tools | Figma → Sketch (cost difference), Notion → Obsidian (self-hosted) |

---

## Implementation Checklist

- [ ] Update TypeScript types in `lib/types.ts`
- [ ] Update database query function `getStackBySlug()` 
- [ ] Add query function `getToolAlternatives()`
- [ ] Enhance page component `app/stack/[slug]/page.tsx`
- [ ] Create `StackWorkflowSection` component
- [ ] Create `StackBudgetWidget` component
- [ ] Create `ToolAlternativesWidget` component
- [ ] Create `AIToolsSection` component
- [ ] Create `LearningResourcesSection` component
- [ ] Test with one profession (Software Engineer)
- [ ] Deploy and monitor
- [ ] Fill data for top 30 professions

---

## Next Steps

1. **Immediately:** Update TypeScript types and queries
2. **Then:** Build new UI components
3. **Then:** Enhance page layout
4. **Then:** Start filling data for top 30 professions

All new fields are **optional** — if data doesn't exist, sections won't display.
