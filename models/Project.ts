import mongoose, { Schema, model, models } from "mongoose";

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    technologies: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["en cours", "terminé", "à venir"],
      default: "à venir",
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    objectives: { type: [String], default: [] },
    duration: {
      type: String,
      default: "",
    },
    githubUrl: {
      type: String,
      default: "",
    },
    takenBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    takenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Project = models.Project || model("Project", projectSchema);

export default Project;
