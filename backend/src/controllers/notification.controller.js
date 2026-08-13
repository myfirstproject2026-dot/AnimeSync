const pool = require("../config/database");

async function getNotifications(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         n.id,
         n.type,
         n.entity_type,
         n.entity_id,
         n.message,
         n.is_read,
         n.created_at,
         a.id AS actor_id,
         a.username AS actor_username,
         a.display_name AS actor_display_name,
         a.avatar_url AS actor_avatar
       FROM notifications n
       LEFT JOIN users a
         ON a.id = n.actor_id
       WHERE n.recipient_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({
      success: true,
      notifications: result.rows
    });
  } catch (error) {
    console.error("Notifications error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load notifications"
    });
  }
}

async function getUnreadCount(req, res) {
  try {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM notifications
       WHERE recipient_id = $1
         AND is_read = FALSE`,
      [req.user.id]
    );

    res.json({
      success: true,
      count: result.rows[0].count
    });
  } catch (error) {
    console.error("Unread notifications error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load unread notification count"
    });
  }
}

async function markNotificationRead(req, res) {
  try {
    const { notificationId } = req.params;

    const result = await pool.query(
      `UPDATE notifications
       SET
         is_read = TRUE,
         read_at = COALESCE(read_at, NOW())
       WHERE id = $1
         AND recipient_id = $2
       RETURNING id, is_read, read_at`,
      [notificationId, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      notification: result.rows[0]
    });
  } catch (error) {
    console.error("Mark notification error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update notification"
    });
  }
}

async function markNotificationsRead(req, res) {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET
         is_read = TRUE,
         read_at = COALESCE(read_at, NOW())
       WHERE recipient_id = $1
         AND is_read = FALSE`,
      [req.user.id]
    );

    res.json({
      success: true,
      updated: result.rowCount
    });
  } catch (error) {
    console.error("Mark notifications error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update notifications"
    });
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markNotificationsRead
};
