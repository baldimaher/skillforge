import mongoose, { Schema, model, models } from "mongoose";

interface IProject {
  title: string;
  description?: string;
  technologies?: string[];
  level?: string;
  createdAt?: Date;
}

const projectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: String,
  technologies: [String],
  level: String,
  createdAt: { type: Date, default: Date.now },
});

// IMPORTANT : vérifier si le modèle existe déjà avant de le créer
const Project = models.Project || model<IProject>("Project", projectSchema);

export default Project;
