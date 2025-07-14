import mongoose, { Schema } from "mongoose";

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
  projectsTaken: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  certificates: [{ type: Schema.Types.ObjectId, ref: "Certificate" }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
