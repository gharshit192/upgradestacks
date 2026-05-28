# Stack Page Enrichment — Complete Data Structure Guide

## 🗂️ Database to UI Flow

```
┌─────────────────────────────────────────────┐
│ SUPABASE DATABASE TABLES                    │
├─────────────────────────────────────────────┤
│ professions                                 │
│  ├─ id, profession_id, name, slug           │
│  ├─ category, description, intro_text       │
│  ├─ 🆕 workflow_description (TEXT)          │
│  ├─ 🆕 skill_level (Enum)                   │
│  └─ 🆕 budget_level (Enum)                  │
│                                             │
│ tools                                       │
│  ├─ id, tool_id, name, slug, website_url   │
│  ├─ short_desc, long_desc, pricing_type    │
│  ├─ india_price, global_price              │
│  ├─ 🆕 is_ai_tool (BOOLEAN)                │
│  └─ 🆕 learning_resource (BOOLEAN)         │
│                                             │
│ stack_connections                           │
│  ├─ profession_slug → tools                │
│  ├─ display_category, importance           │
│  └─ custom_desc, cta_text                  │
│                                             │
│ tool_alternatives (NEW TABLE)               │
│  ├─ tool_id → alternative_tool_id          │
│  └─ reason (TEXT)                          │
└─────────────────────────────────────────────┘
         ↓ (via getStackBySlug)
┌─────────────────────────────────────────────┐
│ TYPESCRIPT TYPES                            │
├─────────────────────────────────────────────┤
│ Profession interface                        │
│  ├─ workflow_description?: string           │
│  ├─ skill_level?: Enum                      │
│  └─ budget_level?: Enum                     │
│                                             │
│ Tool interface                              │
│  ├─ is_ai_tool?: boolean                    │
│  └─ learning_resource?: boolean             │
│                                             │
│ ToolAlternative interface                   │
│  ├─ tool_id: string                         │
│  ├─ alternative_tool_id: string             │
│  ├─ reason: string                          │
│  └─ alternative_tool?: Tool (joined)        │
└─────────────────────────────────────────────┘
         ↓ (via page component)
┌─────────────────────────────────────────────┐
│ REACT UI COMPONENTS                         │
├─────────────────────────────────────────────┤
│ Hero Section                                │
│  ├─ Profession name + emoji                │
│  ├─ SkillLevelBadge (if skill_level)       │
│  ├─ Description                            │
│  └─ Metadata badges                        │
│                                             │
│ Main Content                                │
│  ├─ WorkflowSection (if workflow_desc)    │
│  ├─ Core Tools (regular tools)             │
│  ├─ AI Tools section (if is_ai_tool=true) │
│  └─ Learning Resources (if learning_res=1)│
│                                             │
│ Sidebar                                     │
│  ├─ BudgetWidget (if budget_level)        │
│  ├─ Share section                          │
│  ├─ Ratings section                        │
│  ├─ Submit tool section                    │
│  └─ Email subscribe section                │
│                                             │
│ Tool Cards                                  │
│  ├─ Tool name + logo                       │
│  ├─ Description                            │
│  ├─ Pricing info                           │
│  └─ Alternatives (if tool_alternatives)   │
└─────────────────────────────────────────────┘
```

---

## 📋 What Data Goes Where

### 1. **Profession-Level Fields** (professions table)

| Field | Type | Where it appears | Required? |
|-------|------|-----------------|-----------|
| `workflow_description` | TEXT | WorkflowSection component | Optional |
| `skill_level` | ENUM | SkillLevelBadge in hero | Optional |
| `budget_level` | ENUM | BudgetWidget in sidebar | Optional |

**How to fill:**
```sql
UPDATE professions 
SET 
  workflow_description = 'A typical day for a Backend Engineer starts with checking pull requests and code reviews. Morning (9-12pm): Deep coding on features or fixes. Afternoon (1-5pm): Meetings, documentation, and monitoring. Tools used throughout: VS Code, GitHub, Docker, GitHub Copilot, Slack.',
  skill_level = 'Intermediate',
  budget_level = 'Free + Paid'
WHERE slug = 'backend-engineer';
```

### 2. **Tool-Level Flags** (tools table)

| Flag | Type | What it means | Where it appears |
|------|------|--------------|-----------------|
| `is_ai_tool` | BOOLEAN | This tool uses AI (Cursor, Claude, ChatGPT) | 🤖 AI Tools section |
| `learning_resource` | BOOLEAN | This is for learning (Udemy, YouTube, Books) | 📚 Learning Resources section |

**How to fill:**
```sql
-- Mark AI tools
UPDATE tools SET is_ai_tool = TRUE WHERE slug IN ('cursor', 'claude', 'github-copilot', 'chatgpt-plus');

-- Mark learning resources
UPDATE tools SET learning_resource = TRUE WHERE slug IN ('udemy', 'youtube', 'dev-to');
```

### 3. **Tool Alternatives** (tool_alternatives table)

| Column | Type | Example |
|--------|------|---------|
| `tool_id` | TEXT | 'figma' |
| `alternative_tool_id` | TEXT | 'sketch' |
| `reason` | TEXT | 'Lower cost, desktop-based, for Mac users' |

**How to fill:**
```sql
INSERT INTO tool_alternatives (tool_id, alternative_tool_id, reason)
VALUES
  ('figma', 'sketch', 'Lower cost ($9/mo vs $12/mo), native Mac app, lighter on memory'),
  ('notion', 'obsidian', 'Self-hosted, markdown-based, no recurring cost'),
  ('slack', 'mattermost', 'Open-source alternative, self-hosted option');
```

---

## 🔄 Data Flow Example

### For Software Engineer Stack:

**Database Record:**
```
professions.slug = 'software-engineer'
professions.name = 'Software Engineer'
professions.workflow_description = 'Morning: email/slack/standup. 9am-12pm: coding...'
professions.skill_level = 'Intermediate'
professions.budget_level = 'Free + Paid'

tools (linked via stack_connections):
- Cursor (is_ai_tool = true)
- VS Code (is_ai_tool = false)
- GitHub Copilot (is_ai_tool = true)
- Udemy (learning_resource = true)
- Dev.to (learning_resource = true)
- ...

tool_alternatives:
- Cursor → VS Code (reason: "Free alternative...")
- VS Code → JetBrains IDE (reason: "Commercial option...")
```

**TypeScript Objects:**
```typescript
const profession: Profession = {
  name: 'Software Engineer',
  description: '...',
  workflow_description: 'Morning: email/slack/standup. 9am-12pm: coding...',
  skill_level: 'Intermediate',
  budget_level: 'Free + Paid'
}

const tools: Tool[] = [
  { name: 'Cursor', is_ai_tool: true, learning_resource: false, ... },
  { name: 'GitHub Copilot', is_ai_tool: true, learning_resource: false, ... },
  { name: 'Udemy', is_ai_tool: false, learning_resource: true, ... },
  ...
]

const alternatives: ToolAlternative[] = [
  { tool_id: 'cursor', alternative_tool_id: 'vscode', reason: 'Free alternative...' },
  ...
]
```

**UI Display:**
```
┌─────────────────────────────┐
│ 💻 Software Engineer Stack  │
│ 📈 Intermediate Level       │  ← from skill_level
├─────────────────────────────┤
│ 💼 Typical Workflow         │
│ "Morning: email/slack..."   │  ← from workflow_description
├─────────────────────────────┤
│ 🛠 Core Tools               │
│ VS Code (regular tool)      │
├─────────────────────────────┤
│ 🤖 AI Tools                 │
│ Cursor (is_ai_tool=true)    │
│ GitHub Copilot (is_ai_tool) │
├─────────────────────────────┤
│ 📚 Learning Resources       │
│ Udemy (learning_resource)   │
├─────────────────────────────┤
│ 💰 Budget: $50-200/mo       │  ← from budget_level
│ (calculated from tools)     │
├─────────────────────────────┤
│ Alternatives:               │
│ Cursor → VS Code (Free alt) │  ← from tool_alternatives
└─────────────────────────────┘
```

---

## 📝 Content Creation Checklist

### For Each Profession Stack:

```
Profession: Software Engineer

□ workflow_description
  "Morning (9am): Check email and Slack, attend standup meeting. 
   9:30am-12:30pm: Deep work on features or bug fixes. 
   Afternoon: Code reviews, pair programming, documentation. 
   Typical tools: VS Code, GitHub, Terminal, Slack, Coffee ☕"

□ skill_level
  Choose: Beginner / Intermediate / Advanced

□ budget_level
  Choose: Free / Free+Paid / Premium / Enterprise

□ is_ai_tool flags
  Mark which tools are AI: Cursor, GitHub Copilot, Claude, etc.

□ learning_resource flags
  Mark which tools are for learning: Udemy, YouTube, Dev.to, etc.

□ tool_alternatives
  For each major tool, add 1-2 alternatives:
  - Cursor → VS Code (reason: "Free, open-source alternative")
  - GitHub → GitLab (reason: "Open-source option, self-hosted")
```

---

## 🚀 Implementation Steps

### Step 1: Database Migration (DONE ✅)
SQL migration already created and applied.

### Step 2: TypeScript Types (DONE ✅)
Updated `lib/types.ts` with new fields.

### Step 3: Update Query Functions
```typescript
// lib/supabase.ts
export async function getStackBySlug(slug: string) {
  const { data: profession } = await supabaseAdmin
    .from('professions')
    .select(`
      *,
      stack_connections (
        *,
        tool:tools(*)
      )
    `)
    .eq('slug', slug)
    .single()
  // profession now includes: workflow_description, skill_level, budget_level
}

export async function getToolAlternatives(toolId: string) {
  return await supabaseAdmin
    .from('tool_alternatives')
    .select('*, alternative_tool:tools(*)')
    .eq('tool_id', toolId)
}
```

### Step 4: Create UI Components (IN PROGRESS)
- ✅ WorkflowSection
- ✅ BudgetWidget
- ✅ SkillLevelBadge
- 🔲 ToolAlternativesCard
- 🔲 AIToolsSection
- 🔲 LearningResourcesSection

### Step 5: Update Stack Page
Replace current page with enhanced version that uses new components.

### Step 6: Fill Data
Start with top 30 professions, then scale to all 326.

---

## 📊 Data Validation

Before deploying, validate:

```sql
-- Check workflow descriptions filled
SELECT slug, workflow_description FROM professions 
WHERE workflow_description IS NULL 
LIMIT 10;

-- Check skill levels assigned
SELECT slug, skill_level FROM professions 
WHERE skill_level IS NULL 
LIMIT 10;

-- Check AI tools tagged
SELECT COUNT(*) as ai_tools FROM tools WHERE is_ai_tool = TRUE;

-- Check learning resources tagged
SELECT COUNT(*) as learning_resources FROM tools WHERE learning_resource = TRUE;

-- Check alternatives defined
SELECT COUNT(*) as alternatives FROM tool_alternatives;
```

---

## Next: Data Entry

Once components are built, you'll fill this data for top 30 professions:
1. Software Engineer
2. Product Manager
3. UX Designer
4. Data Scientist
5. Backend Engineer
... (25 more)

Then scale to remaining 296 professions using AI-generation + human review.
