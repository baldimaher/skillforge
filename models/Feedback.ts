import mongoose, { Document, Schema } from "mongoose";

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  comment: string;
  rating: number;
}

// ✅ Évite l’erreur "Cannot overwrite model"
const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

// ✅ Ne redéfinit pas le modèle s’il existe déjà
export default mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);
