CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(30) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(80) NOT NULL,
  avatar_url TEXT,
  bio VARCHAR(160),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT users_role_check
    CHECK (role IN ('user', 'admin')),

  CONSTRAINT users_status_check
    CHECK (status IN ('active', 'suspended', 'banned'))
);

CREATE INDEX IF NOT EXISTS idx_users_username
  ON users (username);

CREATE INDEX IF NOT EXISTS idx_users_created_at
  ON users (created_at DESC);


-- =========================================================
-- POSTS
-- =========================================================

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  content_type VARCHAR(30) NOT NULL,
  media_url TEXT,
  thumbnail_url TEXT,
  external_url TEXT,
  caption TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  visibility VARCHAR(20) NOT NULL DEFAULT 'public',
  status VARCHAR(20) NOT NULL DEFAULT 'published',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT posts_visibility_check
    CHECK (visibility IN ('public', 'followers', 'private')),

  CONSTRAINT posts_status_check
    CHECK (status IN ('draft', 'published', 'archived', 'removed'))
);

CREATE INDEX IF NOT EXISTS idx_posts_author_id
  ON posts (author_id);

CREATE INDEX IF NOT EXISTS idx_posts_created_at
  ON posts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_feed
  ON posts (status, visibility, created_at DESC);


-- =========================================================
-- FOLLOWS
-- =========================================================

CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (follower_id, following_id),

  CONSTRAINT follows_no_self
    CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower
  ON follows (follower_id);

CREATE INDEX IF NOT EXISTS idx_follows_following
  ON follows (following_id);


-- =========================================================
-- POST LIKES
-- =========================================================

CREATE TABLE IF NOT EXISTS post_likes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post
  ON post_likes (post_id);

CREATE INDEX IF NOT EXISTS idx_post_likes_user
  ON post_likes (user_id);


-- =========================================================
-- POST SAVES
-- =========================================================

CREATE TABLE IF NOT EXISTS post_saves (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_post_saves_post
  ON post_saves (post_id);

CREATE INDEX IF NOT EXISTS idx_post_saves_user
  ON post_saves (user_id);


-- =========================================================
-- COMMENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post
  ON comments (post_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_comments_author
  ON comments (author_id);

CREATE INDEX IF NOT EXISTS idx_comments_parent
  ON comments (parent_id);


-- =========================================================
-- NOTIFICATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,

  type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  message TEXT,

  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient
  ON notifications (recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications (recipient_id, is_read, created_at DESC);


-- =========================================================
-- REPORTS
-- =========================================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  target_type VARCHAR(30) NOT NULL,
  target_id UUID NOT NULL,
  reason VARCHAR(100) NOT NULL,
  details TEXT,

  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT reports_status_check
    CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'))
);

CREATE INDEX IF NOT EXISTS idx_reports_status
  ON reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_reporter
  ON reports (reporter_id);


-- =========================================================
-- USEFUL INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_posts_tags
  ON posts USING GIN (tags);