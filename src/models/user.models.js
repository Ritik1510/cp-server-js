import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    username: {
      type: String,
      required: [true, "username is required !!!"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // use when search based task assigned
    },
    fullName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required !!!"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required !!!"],
      unique: true,
    },
    avatar: {
      type: String, // cloudnary url
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
      unique: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// here is arrow fnc is not allowed bcz, the arrow dont provide `this` keyword to use, and 'async' for process takes time.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10); // encryption takes time so use `await`
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccesstoken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshtoken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
