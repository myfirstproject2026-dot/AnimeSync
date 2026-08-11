const pool = require("../config/database");

async function search(req, res) {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      50
    );

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const term = `%${q}%`;

    const [users, posts] = await Promise.all([
      pool.query(
        `SELECT
           id,
           username,
           display_name,
           avatar_url,
           bio
         FROM users
         WHERE status = 'active'
           AND (
             username ILIKE $1
             OR display_name ILIKE $1
             OR bio ILIKE $1
           )
         ORDER BY
           CASE
             WHEN username ILIKE $2 THEN 0
             WHEN display_name ILIKE $2 THEN 1
             ELSE 2
           END,
           created_at DESC
         LIMIT $3`,
        [term, `${q}%`, limit]
      ),

      pool.query(
        `SELECT
           p.id,
           p.content_type,
           p.media_url,
           p.thumbnail_url,
           p.external_url,
           p.caption,
           p.tags,
           p.created_at,
           u.id AS author_id,
           u.username,
           u.display_name,
           u.avatar_url
         FROM posts p
         JOIN users u ON u.id = p.author_id
         WHERE p.status = 'published'
           AND p.visibility = 'public'
           AND (
             p.caption ILIKE $1
             OR EXISTS (
               SELECT 1
               FROM unnest(p.tags) tag
               WHERE tag ILIKE $1
             )
           )
         ORDER BY p.created_at DESC
         LIMIT $2`,
        [term, limit]
      )
    ]);

    res.json({
      success: true,
      query: q,
      users: users.rows,
      posts: posts.rows
    });
  } catch (error) {
    console.error("Search error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to search"
    });
  }
}

async function explore(req, res) {
  try {
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      50
    );

    const result = await pool.query(
      `SELECT
         p.id,
         p.content_type,
         p.media_url,
         p.thumbnail_url,
         p.external_url,
         p.caption,
         p.tags,
         p.created_at,
         u.id AS author_id,
         u.username,
         u.display_name,
         u.avatar_url,
         (SELECT COUNT(*)
            FROM post_likes pl
           WHERE pl.post_id = p.id) AS like_count,
         (SELECT COUNT(*)
            FROM comments c
           WHERE c.post_id = p.id) AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.status = 'published'
         AND p.visibility = 'public'
       ORDER BY
         like_count DESC,
         p.created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      posts: result.rows
    });
  } catch (error) {
    console.error("Explore error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load explore"
    });
  }
}

module.exports = {
  search,
  explore
};
