const express = require("express");
const expValidator = require("express-validator");

const feedController = require("../controllers/feed_controller");

const fileUpload = require("../middleware/file-upload");

const checkAuth = require("../middleware/check-auth");

const router = express.Router();

// GET /feeds/posts
router.get("/post/:pid", feedController.getPostById);

// GET /feeds/posts
router.get("/posts", feedController.getPosts);

//GET /feeds/posts/:uid
router.get("/user/:uid", feedController.getPostsByUserId);

router.use(checkAuth);

// POST api/feeds/post
router.post(
  "/post",
  fileUpload.single("image"),
  [
    expValidator.body("title").trim().isLength({ min: 7 }),
    expValidator.body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

router.patch(
  "/:pid",
  [
    expValidator.check("title").not().isEmpty(),
    expValidator.check("content").isLength({ min: 5 }),
  ],
  feedController.updatePost
);

router.delete("/:pid", feedController.deletePost);

module.exports = router;
