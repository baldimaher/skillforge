import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICertificate extends Document {
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  quizTitle: string;
  score: number;
  date: Date;
  pdfUrl?: string;
}

const CertificateSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  quizTitle: { type: String, required: true },
  score: { type: Number, required: true },
  date: { type: Date, required: true },
  pdfUrl: { type: String, required: false },
});

const CertificateModel =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>("Certificate", CertificateSchema);

export default CertificateModel;
