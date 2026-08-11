CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  content_type VARCHAR(20) NOT NULL,
  media_url TEXT,
  thumbnail_url TEXT,
  external_url TEXT,

  caption TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',

  visibility VARCHAR(20) NOT NULL DEFAULT 'public',
  status VARCHAR(20) NOT NULL DEFAULT 'published',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT posts_content_type_check
    CHECK (content_type IN ('image', 'video', 'gif', 'link')),

  CONSTRAINT posts_visibility_check
    CHECK (visibility IN ('public', 'unlisted')),

  CONSTRAINT posts_status_check
    CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_posts_author
  ON posts (author_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_created
  ON posts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_tags
  ON posts USING GIN (tags);
