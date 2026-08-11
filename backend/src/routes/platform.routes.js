const express = require("express");

const {
  getUserProfile
} = require("../controllers/user.controller");

const {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markNotificationsRead
} = require("../controllers/notification.controller");

const {
  createReport
} = require("../controllers/report.controller");

const {
  requireAuth
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/users/:username", getUserProfile);

router.get(
  "/notifications",
  requireAuth,
  getNotifications
);

router.patch(
  "/notifications/read",
  requireAuth,
  markNotificationsRead
);

router.get(
  "/notifications/unread-count",
  requireAuth,
  getUnreadCount
);

router.patch(
  "/notifications/:notificationId/read",
  requireAuth,
  markNotificationRead
);

router.post(
  "/reports",
  requireAuth,
  createReport
);

module.exports = router;
