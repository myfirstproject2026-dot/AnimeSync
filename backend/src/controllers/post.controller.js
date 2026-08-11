const pool = require("../config/database");

async function createPost(req, res) {
  try {
    const {
      contentType,
      mediaUrl,
      thumbnailUrl,
      externalUrl,
      caption,
      tags,
      visibility
    } = req.body;

    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: "contentType is required"
      });
    }

    if (!mediaUrl && !externalUrl) {
      return res.status(400).json({
        success: false,
        message: "mediaUrl or externalUrl is required"
      });
    }

    const result = await pool.query(
      `INSERT INTO posts
        (author_id, content_type, media_url, thumbnail_url,
         external_url, caption, tags, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        contentType,
        mediaUrl ?? null,
        thumbnailUrl ?? null,
        externalUrl ?? null,
        caption ?? null,
        Array.isArray(tags) ? tags : [],
        visibility || "public"
      ]
    );

    res.status(201).json({
      success: true,
      post: result.rows[0]
    });
  } catch (error) {
    console.error("Create post error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create post"
    });
  }
}

async function getFeed(req, res) {
  try {
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      50
    );

    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const result = await pool.query(
      `SELECT
         p.id,
         p.content_type,
         p.media_url,
         p.thumbnail_url,
         p.external_url,
         p.caption,
         p.tags,
         p.visibility,
         p.created_at,
         u.id AS author_id,
         u.username,
         u.display_name,
         u.avatar_url
       FROM posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.status = 'published'
         AND p.visibility = 'public'
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      success: true,
      posts: result.rows,
      pagination: {
        limit,
        offset,
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error("Get feed error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load feed"
    });
  }
}

async function updatePost(req, res) {
  try {
    const { postId } = req.params;

    const {
      caption,
      tags,
      visibility,
      thumbnailUrl,
      externalUrl,
      mediaUrl
    } = req.body;

    const existing = await pool.query(
      `SELECT id, status
       FROM posts
       WHERE id = $1
         AND author_id = $2`,
      [postId, req.user.id]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    if (existing.rows[0].status === "archived") {
      return res.status(400).json({
        success: false,
        message: "Archived posts cannot be updated"
      });
    }

    const result = await pool.query(
      `UPDATE posts
       SET
         caption = COALESCE($1, caption),
         tags = COALESCE($2, tags),
         visibility = COALESCE($3, visibility),
         thumbnail_url = COALESCE($4, thumbnail_url),
         external_url = COALESCE($5, external_url),
         media_url = COALESCE($6, media_url),
         updated_at = NOW()
       WHERE id = $7
         AND author_id = $8
       RETURNING *`,
      [
        caption ?? null,
        Array.isArray(tags) ? tags : null,
        visibility ?? null,
        thumbnailUrl ?? null,
        externalUrl ?? null,
        mediaUrl ?? null,
        postId,
        req.user.id
      ]
    );

    res.json({
      success: true,
      post: result.rows[0]
    });
  } catch (error) {
    console.error("Update post error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update post"
    });
  }
}

async function deletePost(req, res) {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      `UPDATE posts
       SET
         status = 'archived',
         updated_at = NOW()
       WHERE id = $1
         AND author_id = $2
       RETURNING id, status, updated_at`,
      [postId, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    res.json({
      success: true,
      post: result.rows[0]
    });
  } catch (error) {
    console.error("Delete post error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to delete post"
    });
  }
}

module.exports = {
  createPost,
  getFeed,
  updatePost,
  deletePost
};
