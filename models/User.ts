<<<<<<< HEAD
import mongoose, { Schema } from "mongoose";
=======
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
>>>>>>> 51c4378cc0f3baf5e4a2f8fe5c723ba2f38d5134

const QuizResultSchema = new Schema({
  quiz: { type: Schema.Types.ObjectId, ref: "Quiz" },
  score: Number,
  date: Date,
  title: String,
});

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  birthDate: Date,
  firstName: String,
  lastName: String,
  address: String,
  cvUrl: String,
  cvText: { type: String, default: "" },
  skills: { type: [String], default: [] },
  quizzes: [QuizResultSchema],
  role: { type: String, enum: ["user", "admin"], default: "user" },
<<<<<<< HEAD
  projectsTaken: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  certificates: [{ type: Schema.Types.ObjectId, ref: "Certificate" }],

=======
  projectsTaken: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Certificate" }],
>>>>>>> 51c4378cc0f3baf5e4a2f8fe5c723ba2f38d5134
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resetToken: String,
  resetTokenExpire: Date,
});

// ✅ Hash password with bcrypt before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
