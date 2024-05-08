const express = require("express");
const expValidator = require("express-validator");

const feedController = require("../controllers/feed_controller");

const router = express.Router();

// GET /feed/posts
router.get("/posts", feedController.getPosts);

// POST /feed/posts
router.post(
  "/post",
  [
    expValidator.body("title").trim().isLength({ min: 7 }),
    expValidator.body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

module.exports = router;
