import mongoose from "mongoose";

const formationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  photoUrl: { type: String },      
  videoUrl: { type: String },      
  duration: { type: String },      // <-- ajouté
  instructor: { type: String },    // <-- ajouté
  level: { type: String },         // si tu l’utilises aussi
  category: { type: String },      // si tu l’utilises aussi
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Formation = mongoose.models.Formation || mongoose.model("Formation", formationSchema);

export default Formation;
