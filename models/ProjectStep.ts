import mongoose, { Schema } from "mongoose";

const projectStepSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "L'ID du projet est requis"],
    },
    title: {
      type: String,
      required: [true, "Le titre de l'étape est requis"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["todo", "doing", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    hours: {
      type: Number,
      required: [true, "Le nombre d'heures est requis"],
      min: [0.5, "Le minimum est 0.5 heure"],
    },
    actualHours: {
      type: Number,
      default: 0,
      min: [0, "Les heures réelles ne peuvent pas être négatives"],
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour optimiser les requêtes
projectStepSchema.index({ projectId: 1, order: 1 });

// Middleware pour gérer les dates automatiquement
projectStepSchema.pre('save', function(next) {
  // Si le statut passe à "doing" et qu'il n'y a pas de date de début
  if (this.status === 'doing' && !this.startDate) {
    this.startDate = new Date();
  }
  
  // Si le statut passe à "done" et qu'il n'y a pas de date de fin
  if (this.status === 'done' && !this.endDate) {
    this.endDate = new Date();
  }
  
  next();
});

// Vérifier si le modèle existe déjà pour éviter les erreurs de redéfinition
const ProjectStep = mongoose.models.ProjectStep || mongoose.model("ProjectStep", projectStepSchema);

export default ProjectStep;
