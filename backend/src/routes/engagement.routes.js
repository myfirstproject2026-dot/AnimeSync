const express = require("express");

const {
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  createComment,
  getComments
} = require("../controllers/engagement.controller");

const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/posts/:postId/like", requireAuth, likePost);
router.delete("/posts/:postId/like", requireAuth, unlikePost);

router.post("/posts/:postId/save", requireAuth, savePost);
router.delete("/posts/:postId/save", requireAuth, unsavePost);

router.get("/posts/:postId/comments", getComments);
router.post("/posts/:postId/comments", requireAuth, createComment);

module.exports = router;
