const pool = require("../config/database");

async function getMe(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         u.id,
         u.email,
         u.username,
         u.display_name,
         u.avatar_url,
         u.bio,
         u.role,
         u.status,
         u.created_at,

         (
           SELECT COUNT(*)
           FROM posts p
           WHERE p.author_id = u.id
             AND p.status = 'published'
         )::int AS posts_count,

         (
           SELECT COUNT(*)
           FROM follows f
           WHERE f.following_id = u.id
         )::int AS followers_count,

         (
           SELECT COUNT(*)
           FROM follows f
           WHERE f.follower_id = u.id
         )::int AS following_count

       FROM users u
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load profile"
    });
  }
}

async function updateMe(req, res) {
  try {
    const { displayName, bio, avatarUrl } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET display_name = COALESCE($1, display_name),
           bio = COALESCE($2, bio),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, username, display_name,
                 avatar_url, bio, role, status, created_at`,
      [
        displayName ?? null,
        bio ?? null,
        avatarUrl ?? null,
        req.user.id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update profile"
    });
  }
}

module.exports = {
  getMe,
  updateMe
};
