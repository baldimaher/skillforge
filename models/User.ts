import mongoose from "mongoose";

const QuizResultSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  score: Number,
  date: Date,
  title: String, // Si tu choisis de garder le titre
});const userSchema = new mongoose.Schema({
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
  projectsTaken: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],  // <-- ajouté ici
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
