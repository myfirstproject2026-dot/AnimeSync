const express = require("express");

const {
  createPost,
  getFeed,
  updatePost,
  deletePost
} = require("../controllers/post.controller");

const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/feed", getFeed);

router.post("/", requireAuth, createPost);

router.patch("/:postId", requireAuth, updatePost);

router.delete("/:postId", requireAuth, deletePost);

module.exports = router;
