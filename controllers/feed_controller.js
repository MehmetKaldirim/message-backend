const fs = require("fs");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Post = require("../models/post");
const User = require("../models/user");

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
  // if (!posts || posts.length === 0) {
  //   return next(
  //     new HttpError("Could not find  posts for the provided user id.", 404)
  //   );
  // }

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
  // "https://avatars.githubusercontent.com/u/45769545?v=4",

  const createdPost = new Post({
    title: title,
    content: content,
    imageUrl: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPost.save({ session: sess });
    user.posts.push(createdPost);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    //console.log("err = " + err);
    const error = new HttpError("Creating post failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ post: createdPost });
};

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, content } = req.body;
  const postId = req.params.pid;

  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find post with this id.",
      500
    );
    return next(error);
  }

  if (post.creator.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this post.", 401);
    return next(error);
  }

  post.title = title;
  post.content = content;

  try {
    await post.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not save the updated post.",
      500
    );
    return next(error);
  }

  res.status(200).json({ post: post.toObject({ getters: true }) });
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.pid;

  let post;
  try {
    post = await Post.findById(postId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not post with this id.",
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError("Could not find post for this id.", 404);
    return next(error);
  }
  if (post.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this post.",
      401
    );
    return next(error);
  }

  const imagePath = post.imageUrl;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await post.deleteOne({ session: sess });
    //await Place.findByIdAndDelete(placeId);
    post.creator.posts.pull(post);
    await post.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    console.log(err);
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Deleted place." });
};
