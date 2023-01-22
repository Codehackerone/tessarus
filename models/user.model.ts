import mongoose from "mongoose";
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  espektro_id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Others"],
  },
  dateOfBirth: {
    type: Date,
  },
  college: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    enum: ["B.Tech", "M.Tech", "MCA"],
  },
  year: {
    type: String,
  },
  stream: {
    type: String,
  },
  coins: {
    type: Number,
    default: 0,
  },
});

userSchema.pre("save", async function (next: any) {
  if (!this.isModified || !this.isNew) {
    next();
  } else this.isModified("password");
  if (this.password) this.password = bcrypt.hashSync(String(this.password), 12);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
