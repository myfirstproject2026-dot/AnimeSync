const express = require("express");

const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require("../controllers/follow.controller");

const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/users/:userId/follow", requireAuth, followUser);
router.delete("/users/:userId/follow", requireAuth, unfollowUser);

router.get("/users/:userId/followers", getFollowers);
router.get("/users/:userId/following", getFollowing);

module.exports = router;
