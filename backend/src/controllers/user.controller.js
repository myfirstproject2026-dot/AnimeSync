const pool = require("../config/database");

async function getUserProfile(req, res) {
  try {
    const { username } = req.params;

    const result = await pool.query(
      `SELECT
         u.id,
         u.username,
         u.display_name,
         u.avatar_url,
         u.bio,
         u.created_at,
         (SELECT COUNT(*)
            FROM follows f
           WHERE f.following_id = u.id) AS followers_count,
         (SELECT COUNT(*)
            FROM follows f
           WHERE f.follower_id = u.id) AS following_count,
         (SELECT COUNT(*)
            FROM posts p
           WHERE p.author_id = u.id
             AND p.status = 'published') AS posts_count
       FROM users u
       WHERE u.username = $1
         AND u.status = 'active'`,
      [username.toLowerCase()]
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
    console.error("Profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load profile"
    });
  }
}

module.exports = {
  getUserProfile
};
