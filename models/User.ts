import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  phone: { type: String },
  birthDate: { type: Date },

  firstName: { type: String },
  lastName: { type: String },
  address: { type: String },

  cvUrl: { type: String },

  cvText: { type: String, default: "" },        // <== ajouter ce champ pour texte PDF extrait
  skills: { type: [String], default: [] },
  
   quizResults: [
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    score: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
    passed: { type: Boolean, required: true },
    answers: { type: [Number], default: [] }  // réponses choisies par question
  },
],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
