-- =====================================================
-- Dominican Shuttle - Blog + SEO automático
-- =====================================================
-- Tabla de posts para publicación interna con metadatos SEO
-- y control de publicación diaria idempotente.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content_markdown TEXT,
  content_html TEXT NOT NULL,
  cover_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  focus_keyword TEXT,
  schema_json JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  publish_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  published_day DATE,
  source TEXT NOT NULL DEFAULT 'ai',
  ai_model TEXT,
  tokens_used INTEGER,
  generation_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS published_day DATE;

UPDATE blog_posts
SET published_day = (published_at AT TIME ZONE 'UTC')::date
WHERE published_at IS NOT NULL
  AND published_day IS NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_publish_at ON blog_posts (publish_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at_desc ON blog_posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_day ON blog_posts (published_day);
CREATE INDEX IF NOT EXISTS idx_blog_posts_focus_keyword ON blog_posts (focus_keyword);

-- Evita que se publiquen dos posts el mismo día.
CREATE UNIQUE INDEX IF NOT EXISTS uq_blog_posts_published_day
ON blog_posts (published_day)
WHERE status = 'published' AND published_day IS NOT NULL;
