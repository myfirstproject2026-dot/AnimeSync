const pool = require("../config/database");

async function createNotification({
  recipientId,
  actorId = null,
  type,
  entityType = null,
  entityId = null,
  message = null,
  postId = null,
  commentId = null
}) {
  if (!recipientId || !type) return;

  if (actorId && recipientId === actorId) return;

  await pool.query(
    `INSERT INTO notifications
      (
        recipient_id,
        actor_id,
        type,
        entity_type,
        entity_id,
        message,
        post_id,
        comment_id
      )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      recipientId,
      actorId,
      type,
      entityType,
      entityId,
      message,
      postId,
      commentId
    ]
  );
}

module.exports = {
  createNotification
};
