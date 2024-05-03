const express = require("express");

const feedController = require("../controllers/feed_controller");

const router = express.Router();

// GET /feed/posts
router.get("/posts", feedController.getPosts);

// GET /feed/posts
router.post("/post", feedController.createPost);

module.exports = router;
