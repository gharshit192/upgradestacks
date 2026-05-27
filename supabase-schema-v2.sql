-- UpgradeStacks — Schema v2 (Community Features)
-- Run this AFTER the original schema

-- ── View Counts ─────────────────────────────────────────────────────
-- Tracks every page view per profession
CREATE TABLE IF NOT EXISTS page_views (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profession_slug TEXT NOT NULL,
  viewer_ip       TEXT,                     -- hashed, for deduplication
  user_id         UUID,                     -- null if not logged in
  viewed_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_page_views_slug ON page_views(profession_slug);
CREATE INDEX idx_page_views_date ON page_views(viewed_at);

-- ── User Accounts ────────────────────────────────────────────────────
-- Extends Supabase Auth (auth.users) with profile data
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE,
  display_name    TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  profession_slug TEXT,                     -- their primary profession
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Saved Stacks ─────────────────────────────────────────────────────
-- Users save stacks to their profile
CREATE TABLE IF NOT EXISTS saved_stacks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profession_slug TEXT NOT NULL,
  saved_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, profession_slug)
);
CREATE INDEX idx_saved_stacks_user ON saved_stacks(user_id);
CREATE INDEX idx_saved_stacks_slug ON saved_stacks(profession_slug);

-- ── Saved Tools (Custom Stack) ───────────────────────────────────────
-- Users customize their stack by saving/removing individual tools
CREATE TABLE IF NOT EXISTS saved_tools (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profession_slug TEXT NOT NULL,
  tool_id         TEXT NOT NULL REFERENCES tools(tool_id) ON DELETE CASCADE,
  saved_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, profession_slug, tool_id)
);

-- ── Community Ratings ────────────────────────────────────────────────
-- Users rate tools within a specific stack
CREATE TABLE IF NOT EXISTS tool_ratings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  profession_slug TEXT NOT NULL,
  tool_id         TEXT NOT NULL REFERENCES tools(tool_id) ON DELETE CASCADE,
  rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review          TEXT,
  helpful_count   INTEGER DEFAULT 0,
  rated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, profession_slug, tool_id)   -- one rating per user per tool per stack
);
CREATE INDEX idx_ratings_tool ON tool_ratings(tool_id);
CREATE INDEX idx_ratings_profession ON tool_ratings(profession_slug);

-- ── Computed Ratings View ────────────────────────────────────────────
-- Auto-calculates average rating + count per tool per profession
CREATE OR REPLACE VIEW tool_rating_summary AS
SELECT
  profession_slug,
  tool_id,
  ROUND(AVG(rating)::numeric, 1)  AS avg_rating,
  COUNT(*)                         AS total_ratings
FROM tool_ratings
GROUP BY profession_slug, tool_id;

-- ── Share Events ─────────────────────────────────────────────────────
-- Tracks how stacks are shared
CREATE TABLE IF NOT EXISTS share_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profession_slug TEXT NOT NULL,
  platform        TEXT,                     -- 'whatsapp', 'copy', 'twitter'
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shared_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_shares_slug ON share_events(profession_slug);

-- ── Tool Helpful Votes ───────────────────────────────────────────────
-- Users mark tools as "helpful" or "not helpful"
CREATE TABLE IF NOT EXISTS tool_votes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tool_id         TEXT NOT NULL REFERENCES tools(tool_id) ON DELETE CASCADE,
  profession_slug TEXT NOT NULL,
  vote            TEXT NOT NULL CHECK (vote IN ('up', 'down')),
  voted_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id, profession_slug)
);

-- ── RLS Policies for new tables ──────────────────────────────────────
ALTER TABLE page_views     ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_stacks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_tools    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_ratings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_votes     ENABLE ROW LEVEL SECURITY;

-- Public can insert views (anonymous tracking)
CREATE POLICY "Public insert views" ON page_views FOR INSERT WITH CHECK (true);

-- Authenticated users manage their own data
CREATE POLICY "Users read own profile"   ON profiles     FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles     FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles     FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users manage saved stacks" ON saved_stacks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage saved tools" ON saved_tools
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read ratings" ON tool_ratings FOR SELECT USING (true);
CREATE POLICY "Auth users insert ratings" ON tool_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own ratings" ON tool_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public insert shares"  ON share_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read profiles"  ON profiles     FOR SELECT USING (true);

CREATE POLICY "Public insert votes"   ON tool_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read votes"     ON tool_votes  FOR SELECT USING (true);

-- ── Stored Procedure: increment view count ───────────────────────────
-- Called by API instead of direct INSERT for rate limiting
CREATE OR REPLACE FUNCTION increment_view_count(p_slug TEXT, p_ip TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Insert view record
  INSERT INTO page_views (profession_slug, viewer_ip)
  VALUES (p_slug, md5(COALESCE(p_ip, 'anon')));

  -- Update user_count on profession (every 10 views to reduce writes)
  UPDATE professions
  SET user_count = (
    SELECT COUNT(DISTINCT viewer_ip) FROM page_views WHERE profession_slug = p_slug
  )
  WHERE slug = p_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Trigger: auto-create profile on signup ────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

