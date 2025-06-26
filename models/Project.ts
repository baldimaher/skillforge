import mongoose, { Schema, model, models } from "mongoose";

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    technologies: { type: [String], default: [] },
    status: { type: String, enum: ["en cours", "terminé", "à venir"], default: "à venir" },
    takenBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

  },
  { timestamps: true }
);

const Project = models.Project || model("Project", projectSchema);

export default Project;
