-- UpgradeStacks — Supabase Database Schema
-- Run this in Supabase SQL Editor to create all tables
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste this → Run

-- ── Enable UUID extension ──────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Table 1: professions ───────────────────────
CREATE TABLE IF NOT EXISTS professions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profession_id   TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  category        TEXT NOT NULL,
  sub_category    TEXT,
  description     TEXT,
  intro_text      TEXT,
  seo_title       TEXT,
  seo_description TEXT,
  india_specific  BOOLEAN DEFAULT FALSE,
  search_volume   TEXT,
  priority        TEXT DEFAULT 'P2',
  status          TEXT DEFAULT 'draft' CHECK (status IN ('live', 'draft', 'planned')),
  user_count      INTEGER DEFAULT 0,
  rating          DECIMAL(2,1) DEFAULT 4.5,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Table 2: tools ────────────────────────────
CREATE TABLE IF NOT EXISTS tools (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id              TEXT UNIQUE NOT NULL,
  name                 TEXT NOT NULL,
  slug                 TEXT UNIQUE NOT NULL,
  website_url          TEXT NOT NULL,
  affiliate_url        TEXT,
  category             TEXT NOT NULL,
  short_desc           TEXT NOT NULL,
  long_desc            TEXT,
  pricing_type         TEXT DEFAULT 'Freemium' CHECK (pricing_type IN ('Free', 'Freemium', 'Paid')),
  has_free_plan        BOOLEAN DEFAULT FALSE,
  india_price          TEXT,
  global_price         TEXT,
  india_available      BOOLEAN DEFAULT TRUE,
  logo_emoji           TEXT DEFAULT '🔧',
  affiliate_commission TEXT,
  verified             BOOLEAN DEFAULT FALSE,
  rating               DECIMAL(2,1) DEFAULT 4.5,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── Table 3: stack_connections ────────────────
-- THIS IS THE CORE TABLE — every row = 1 tool on 1 stack page
CREATE TABLE IF NOT EXISTS stack_connections (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profession_slug   TEXT NOT NULL REFERENCES professions(slug) ON DELETE CASCADE,
  tool_id           TEXT NOT NULL REFERENCES tools(tool_id) ON DELETE CASCADE,
  display_category  TEXT NOT NULL,
  importance        TEXT NOT NULL DEFAULT 'Recommended'
                    CHECK (importance IN ('Essential', 'Recommended', 'Optional')),
  display_order     INTEGER DEFAULT 1,
  custom_desc       TEXT,
  cta_text          TEXT DEFAULT 'Visit Site',
  show_price        BOOLEAN DEFAULT TRUE,
  india_only        BOOLEAN DEFAULT FALSE,
  active            BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profession_slug, tool_id)
);

-- ── Table 4: tool_submissions ─────────────────
CREATE TABLE IF NOT EXISTS tool_submissions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profession_slug  TEXT NOT NULL,
  tool_name        TEXT NOT NULL,
  tool_url         TEXT,
  category         TEXT,
  reason           TEXT,
  submitter_email  TEXT,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Table 5: email_subscribers ────────────────
CREATE TABLE IF NOT EXISTS email_subscribers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT UNIQUE NOT NULL,
  profession_slug  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes (for fast queries) ────────────────
CREATE INDEX idx_professions_slug ON professions(slug);
CREATE INDEX idx_professions_status ON professions(status);
CREATE INDEX idx_professions_category ON professions(category);
CREATE INDEX idx_tools_slug ON tools(slug);
CREATE INDEX idx_tools_tool_id ON tools(tool_id);
CREATE INDEX idx_stack_connections_profession ON stack_connections(profession_slug);
CREATE INDEX idx_stack_connections_active ON stack_connections(active);
CREATE INDEX idx_tool_submissions_status ON tool_submissions(status);

-- ── Auto-update updated_at ────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER professions_updated_at
  BEFORE UPDATE ON professions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security (RLS) ──────────────────
-- Enable RLS on all tables
ALTER TABLE professions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Public can READ professions and tools (anon key)
CREATE POLICY "Public read professions" ON professions FOR SELECT USING (status = 'live');
CREATE POLICY "Public read tools" ON tools FOR SELECT USING (TRUE);
CREATE POLICY "Public read stack connections" ON stack_connections FOR SELECT USING (active = TRUE);

-- Public can INSERT submissions and subscribers (anon key)
CREATE POLICY "Public insert submissions" ON tool_submissions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public insert subscribers" ON email_subscribers FOR INSERT WITH CHECK (TRUE);

-- Only service role can do everything else (admin operations)
-- Service role key bypasses RLS automatically

-- ── Sample data to test ───────────────────────
-- Run AFTER schema is created to verify everything works

INSERT INTO professions (profession_id, name, slug, category, description, seo_title, seo_description, india_specific, status, user_count, priority) VALUES
('GD001', 'Graphic Designer', 'graphic-designer', 'Creative',
 'The complete toolkit for graphic designers in India and globally — design tools, productivity apps, learning resources, and income platforms.',
 'Graphic Designer Stack — Best Tools & Apps 2026',
 'The complete toolkit for graphic designers in India. Figma, Canva, Adobe CC, Behance and more. Used by 3,000+ designers.',
 TRUE, 'live', 3240, 'P1'),
('CA001', 'CA Student', 'ca-student', 'Finance',
 'The complete toolkit for CA Foundation, Inter, and Final students in India — accounting software, study resources, and investment apps.',
 'CA Student Stack — Best Tools for CA Exam 2026',
 'Complete toolkit for CA students in India. Tally, ClearTax, Excel, ICAI material and more.',
 TRUE, 'live', 5820, 'P1');

INSERT INTO tools (tool_id, name, slug, website_url, affiliate_url, category, short_desc, pricing_type, has_free_plan, india_price, global_price, india_available, logo_emoji, verified) VALUES
('T001', 'Figma', 'figma', 'https://figma.com', NULL, 'Design',
 'Best UI/UX and graphic design tool. Real-time collaboration, free for individuals.',
 'Freemium', TRUE, 'Free / ₹1,000/mo Pro', 'Free / $15/mo', TRUE, '🖊', TRUE),
('T002', 'Canva', 'canva', 'https://canva.com', 'https://canva.com/affiliates', 'Design',
 'Quick graphics, social media posts, and presentations. India pricing available.',
 'Freemium', TRUE, 'Free / ₹3,999/yr Pro', 'Free / $12.99/mo', TRUE, '🖼', TRUE);

INSERT INTO stack_connections (profession_slug, tool_id, display_category, importance, display_order, custom_desc, cta_text) VALUES
('graphic-designer', 'T001', '🎨 Design Tools', 'Essential', 1,
 'Best tool for UI/UX and graphic design. Real-time collaboration, free for individuals.', 'Try Free'),
('graphic-designer', 'T002', '🎨 Design Tools', 'Essential', 2,
 'Quick graphics, social media posts. India pricing ₹3,999/year Pro.', 'Try Free');

-- ✅ Schema complete. Verify by running:
-- SELECT * FROM professions;
-- SELECT * FROM tools;
-- SELECT * FROM stack_connections;
