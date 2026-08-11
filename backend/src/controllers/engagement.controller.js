const pool = require("../config/database");
const { createNotification } = require("../utils/notification");

async function likePost(req, res) {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      `INSERT INTO post_likes (user_id, post_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, post_id) DO NOTHING
       RETURNING post_id`,
      [req.user.id, postId]
    );

    if (result.rowCount > 0) {
      const post = await pool.query(
        `SELECT author_id
         FROM posts
         WHERE id = $1
         LIMIT 1`,
        [postId]
      );

      if (post.rowCount > 0) {
        await createNotification({
          recipientId: post.rows[0].author_id,
          actorId: req.user.id,
          type: "like",
          entityType: "post",
          entityId: postId,
          message: "liked your post",
          postId
        });
      }
    }

    res.status(201).json({
      success: true,
      liked: true
    });
  } catch (error) {
    console.error("Like error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to like post"
    });
  }
}

async function unlikePost(req, res) {
  try {
    const { postId } = req.params;

    await pool.query(
      `DELETE FROM post_likes
       WHERE user_id = $1 AND post_id = $2`,
      [req.user.id, postId]
    );

    res.json({
      success: true,
      liked: false
    });
  } catch (error) {
    console.error("Unlike error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to unlike post"
    });
  }
}

async function savePost(req, res) {
  try {
    const { postId } = req.params;

    await pool.query(
      `INSERT INTO post_saves (user_id, post_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, post_id) DO NOTHING`,
      [req.user.id, postId]
    );

    res.status(201).json({
      success: true,
      saved: true
    });
  } catch (error) {
    console.error("Save error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to save post"
    });
  }
}

async function unsavePost(req, res) {
  try {
    const { postId } = req.params;

    await pool.query(
      `DELETE FROM post_saves
       WHERE user_id = $1 AND post_id = $2`,
      [req.user.id, postId]
    );

    res.json({
      success: true,
      saved: false
    });
  } catch (error) {
    console.error("Unsave error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to unsave post"
    });
  }
}

async function createComment(req, res) {
  try {
    const { postId } = req.params;
    const { body, parentId } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment body is required"
      });
    }

    const result = await pool.query(
      `INSERT INTO comments
        (post_id, author_id, parent_id, body)
       VALUES ($1, $2, $3, $4)
       RETURNING id, post_id, author_id, parent_id, body, created_at`,
      [
        postId,
        req.user.id,
        parentId || null,
        body.trim()
      ]
    );

    const comment = result.rows[0];

    const post = await pool.query(
      `SELECT author_id
       FROM posts
       WHERE id = $1
       LIMIT 1`,
      [postId]
    );

    if (post.rowCount > 0) {
      await createNotification({
        recipientId: post.rows[0].author_id,
        actorId: req.user.id,
        type: "comment",
        entityType: "comment",
        entityId: comment.id,
        message: "commented on your post",
        postId,
        commentId: comment.id
      });
    }

    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    console.error("Comment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create comment"
    });
  }
}
async function getComments(req, res) {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      `SELECT
         c.id,
         c.post_id,
         c.author_id,
         c.parent_id,
         c.body,
         c.created_at,
         u.username,
         u.display_name,
         u.avatar_url
       FROM comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );

    res.json({
      success: true,
      comments: result.rows
    });
  } catch (error) {
    console.error("Get comments error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load comments"
    });
  }
}

module.exports = {
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  createComment,
  getComments
};
