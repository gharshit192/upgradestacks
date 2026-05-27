# UpgradeStacks.com — Complete Codebase

> The Complete Stack for Every Type of Person  
> Build Once. Grow Forever.

---

## What This Is

A **programmatic SEO website** built with Next.js 14 + Supabase.

- Add a profession to the database → a new page appears at `/stack/[slug]` automatically
- No code changes needed to add new pages
- Google indexes every page and sends free organic traffic
- One template handles 10,000+ pages

---

## Project Structure

```
upgradestacks/
│
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage (/)
│   ├── layout.tsx                # Root layout + fonts + metadata
│   ├── globals.css               # Global styles + Tailwind
│   ├── not-found.tsx             # 404 page
│   │
│   ├── stack/
│   │   └── [slug]/
│   │       └── page.tsx          # ⭐ THE CORE ENGINE
│   │                             # Auto-generates ALL stack pages
│   │                             # /stack/graphic-designer
│   │                             # /stack/ca-student
│   │                             # /stack/youtuber ... etc
│   │
│   ├── category/
│   │   └── [category]/
│   │       └── page.tsx          # Category browse pages
│   │
│   ├── submit/
│   │   └── page.tsx              # Community tool submission page
│   │
│   └── api/
│       ├── submit-tool/
│       │   └── route.ts          # POST: store tool submission
│       ├── subscribe/
│       │   └── route.ts          # POST: email subscribe
│       └── revalidate/
│           └── route.ts          # POST: trigger page refresh (webhook)
│
├── components/                   # Reusable UI components
│   ├── Navbar.tsx                # Top navigation bar
│   ├── Footer.tsx                # Site footer
│   ├── SearchBar.tsx             # 🔍 Fuzzy search (client component)
│   ├── ToolCard.tsx              # Individual tool display card
│   ├── SubmitToolForm.tsx        # Community submission form
│   └── EmailSubscribe.tsx        # Email capture form
│
├── lib/                          # Utilities and data layer
│   ├── supabase.ts               # ⭐ ALL database calls live here
│   └── types.ts                  # TypeScript type definitions
│
├── public/                       # Static assets (logo, favicon)
│
├── supabase-schema.sql           # Database schema — run once in Supabase
├── next.config.js                # Next.js configuration
├── next-sitemap.config.js        # Auto-sitemap configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── .env.example                  # Environment variables template
└── package.json                  # Dependencies
```

---

## How It Works (The Core Concept)

```
Supabase Database
      ↓
lib/supabase.ts reads data
      ↓
app/stack/[slug]/page.tsx renders it
      ↓
upgradestacks.com/stack/graphic-designer
upgradestacks.com/stack/ca-student
upgradestacks.com/stack/[any-profession]
      ↓
Google indexes → Free traffic forever
```

**One file. One template. Infinite pages.**

---

## Setup Instructions

### Step 1 — Clone and Install

```bash
git clone https://github.com/yourusername/upgradestacks.git
cd upgradestacks
npm install
```

### Step 2 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** → **New Query**
4. Paste the entire contents of `supabase-schema.sql`
5. Click **Run**
6. All tables are created + sample data inserted

### Step 3 — Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://upgradestacks.com
REVALIDATE_SECRET=your-random-secret
```

Find your keys at: Supabase Dashboard → Project Settings → API

### Step 4 — Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see:
- Homepage with search bar
- `/stack/graphic-designer` — working stack page
- `/stack/ca-student` — working stack page

### Step 5 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, then add environment variables in Vercel dashboard
```

Or connect GitHub repo directly at [vercel.com](https://vercel.com) for auto-deploy.

---

## Database Management

### How to Add a New Profession

1. Go to Supabase Dashboard → Table Editor → `professions`
2. Click **Insert Row**
3. Fill in these fields:

| Field | Example |
|-------|---------|
| profession_id | YT001 |
| name | Yoga Teacher |
| slug | yoga-teacher |
| category | Health |
| description | Short description... |
| seo_title | Yoga Teacher Stack — Best Tools 2026 |
| seo_description | Complete toolkit for yoga teachers... |
| india_specific | true |
| status | **live** |
| user_count | 0 |
| priority | P2 |

4. Click Save
5. The page `/stack/yoga-teacher` is now live

> Note: ISR revalidates every 24 hours automatically. For immediate update, call the revalidate webhook.

### How to Add a New Tool

1. Supabase → `tools` table → Insert Row
2. Fill all fields including `affiliate_url` if available
3. Note the `tool_id` you set (e.g. `T050`)

### How to Connect a Tool to a Profession (Stack Connection)

1. Supabase → `stack_connections` table → Insert Row

| Field | Value |
|-------|-------|
| profession_slug | yoga-teacher |
| tool_id | T050 |
| display_category | 🧘 Practice Tools |
| importance | Essential |
| display_order | 1 |
| cta_text | Try Free |
| active | true |

2. Save. The tool now appears on `/stack/yoga-teacher`

### How to Approve a Community Submission

1. Supabase → `tool_submissions` table
2. Find submissions with `status = 'pending'`
3. Review the submission
4. If good: add the tool to `tools` table, then add to `stack_connections`
5. Update submission `status` to `'approved'`

---

## The Revalidation Webhook

When you add data to Supabase, the website doesn't update immediately (it's cached).

To trigger an immediate update, call this endpoint:

```bash
curl -X POST https://upgradestacks.com/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: YOUR_REVALIDATE_SECRET" \
  -d '{"type": "profession", "slug": "yoga-teacher"}'
```

**Or set up automatic webhook in Supabase:**
1. Supabase → Database → Webhooks
2. Create webhook on `professions` table (INSERT + UPDATE events)
3. URL: `https://upgradestacks.com/api/revalidate`
4. Add header: `x-revalidate-secret: YOUR_REVALIDATE_SECRET`
5. Body: `{"type": "all"}`

Now every database change automatically refreshes the site within 60 seconds.

---

## SEO

Every stack page automatically gets:

- ✅ Unique `<title>` from database `seo_title` field
- ✅ Unique `<meta description>` from `seo_description` field
- ✅ Canonical URL tag
- ✅ OpenGraph tags for social sharing
- ✅ JSON-LD structured data (ItemList schema)
- ✅ Auto-generated sitemap at `/sitemap.xml`
- ✅ `robots.txt` allowing all crawlers
- ✅ Static generation (pre-built at deploy time)
- ✅ ISR revalidation every 24 hours

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Styling | Tailwind CSS |
| Search | Fuse.js (client-side fuzzy) |
| Fonts | Google Fonts (Sora + DM Sans) |
| Sitemap | next-sitemap |
| Language | TypeScript |

---

## Environment Variables Reference

| Variable | Where to Get | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your domain | Yes |
| `REVALIDATE_SECRET` | Generate: `openssl rand -hex 32` | Yes |
| `RESEND_API_KEY` | resend.com | Optional |
| `NEXT_PUBLIC_GA_ID` | Google Analytics | Optional |

---

## Growth Roadmap

### Phase 1 (Months 1-2) — Already Built
- [x] Homepage with search
- [x] Auto-generated stack pages
- [x] Category pages
- [x] Tool submission form
- [x] Email subscribe
- [x] SEO + sitemap

### Phase 2 (Months 3-4) — Add Community
- [ ] User accounts (Supabase Auth)
- [ ] Save your stack (user profiles)
- [ ] Shareable profile pages (`/u/username`)
- [ ] Upvote tools within a stack
- [ ] Tool reviews and ratings

### Phase 3 (Months 5-6) — Monetize
- [ ] Featured tool listings (paid placements)
- [ ] Newsletter system (Resend)
- [ ] Blog section for additional SEO
- [ ] Analytics dashboard for admin

---

## Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Check for TypeScript errors
```

---

## Contact & Support

Domain: upgradestacks.com  
Built with Next.js + Supabase + Vercel  
Questions: See Developer Brief document

---

*Build Once. Grow Forever.*
