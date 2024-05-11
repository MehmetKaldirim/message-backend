const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
