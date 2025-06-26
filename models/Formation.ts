import mongoose from "mongoose";

const formationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  photoUrl: { type: String },      // URL de la photo (ex : affichage miniature)
  videoUrl: { type: String },      // URL vidéo associée
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Formation = mongoose.models.Formation || mongoose.model("Formation", formationSchema);

export default Formation;
