const pool = require("../config/database");
const { createNotification } = require("../utils/notification");

async function followUser(req, res) {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself"
      });
    }

    const target = await pool.query(
      "SELECT id FROM users WHERE id = $1 AND status = 'active'",
      [userId]
    );

    if (target.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const result = await pool.query(
      `INSERT INTO follows (follower_id, following_id)
       VALUES ($1, $2)
       ON CONFLICT (follower_id, following_id) DO NOTHING
       RETURNING following_id`,
      [req.user.id, userId]
    );

    if (result.rowCount > 0) {
      await createNotification({
        recipientId: userId,
        actorId: req.user.id,
        type: "follow",
        entityType: "user",
        entityId: userId,
        message: "started following you"
      });
    }

    res.status(201).json({
      success: true,
      following: true
    });
  } catch (error) {
    console.error("Follow error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to follow user"
    });
  }
}
async function unfollowUser(req, res) {
  try {
    const { userId } = req.params;

    await pool.query(
      `DELETE FROM follows
       WHERE follower_id = $1 AND following_id = $2`,
      [req.user.id, userId]
    );

    res.json({
      success: true,
      following: false
    });
  } catch (error) {
    console.error("Unfollow error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to unfollow user"
    });
  }
}

async function getFollowers(req, res) {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT
         u.id,
         u.username,
         u.display_name,
         u.avatar_url
       FROM follows f
       JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error("Followers error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load followers"
    });
  }
}

async function getFollowing(req, res) {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT
         u.id,
         u.username,
         u.display_name,
         u.avatar_url
       FROM follows f
       JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error("Following error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load following"
    });
  }
}

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
};
