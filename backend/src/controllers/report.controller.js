const pool = require("../config/database");

async function createReport(req, res) {
  try {
    const {
      postId,
      reportedUserId,
      reason,
      details
    } = req.body;

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({
        success: false,
        message: "Reason is required"
      });
    }

    if (!postId && !reportedUserId) {
      return res.status(400).json({
        success: false,
        message: "postId or reportedUserId is required"
      });
    }

    if (postId && reportedUserId) {
      return res.status(400).json({
        success: false,
        message: "Provide either postId or reportedUserId, not both"
      });
    }

    const targetType = postId ? "post" : "user";
    const targetId = postId || reportedUserId;

    const result = await pool.query(
      `INSERT INTO reports
        (
          reporter_id,
          target_type,
          target_id,
          reason,
          details,
          post_id,
          reported_user_id
        )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING
         id,
         target_type,
         target_id,
         reason,
         status,
         created_at,
         updated_at`,
      [
        req.user.id,
        targetType,
        targetId,
        String(reason).trim(),
        details || null,
        postId || null,
        reportedUserId || null
      ]
    );

    res.status(201).json({
      success: true,
      report: result.rows[0]
    });
  } catch (error) {
    console.error("Report error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to submit report"
    });
  }
}

module.exports = {
  createReport
};
