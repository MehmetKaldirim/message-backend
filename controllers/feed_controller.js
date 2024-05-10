const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Post = require("../models/post");

exports.getPostById = async (req, res, next) => {
  const postId = req.params.pid; // { pid: 'p1' }
  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find post.",
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError(
      "Could not find a post for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ post: post.toObject({ getters: true }) }); // => { place } => { place: place }
};

exports.getPosts = async (req, res, next) => {
  let posts;
  try {
    posts = await Post.find();
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later",
      500
    );
    return next(error);
  }
  if (!posts || posts.length === 0) {
    return next(new HttpError("Could not find any posts.", 404));
  }

  res.json({
    posts: posts.map((place) => place.toObject({ getters: true })),
  });
};

exports.getPostsByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let posts;
  try {
    posts = await Post.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Fetching posts failed, please try again later",
      500
    );
    return next(error);
  }
  if (!posts || posts.length === 0) {
    return next(
      new HttpError("Could not find  posts for the provided user id.", 404)
    );
  }

  res.json({
    posts: posts.map((place) => place.toObject({ getters: true })),
  });
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    next(new HttpError("Invalid inputs passed, please check your data", 422));
  }
  const { title, content } = req.body;

  // const title = req.body.title;
  const createdPost = new Post({
    title,
    content,
    creator: { name: "Math" },
    imageUrl: "https://avatars.githubusercontent.com/u/45769545?v=4",
    createdAt: new Date(),
  });

  try {
    await createdPost.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Creating post failed, please try again", 500);
    return next(error);
  }

  res.status(201).json({ post: createdPost });
};
