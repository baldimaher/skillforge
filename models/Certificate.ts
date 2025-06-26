// models/Certificate.ts

import mongoose, { Document, Schema } from "mongoose";

export interface ICertificate extends Document {
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  date: Date;
}

const CertificateSchema: Schema = new Schema({
  userId: { type: String, required: true },
  quizId: { type: String, required: true },
  quizTitle: { type: String, required: true },
  score: { type: Number, required: true },
  date: { type: Date, required: true },
});

export default mongoose.models.Certificate ||
  mongoose.model<ICertificate>("Certificate", CertificateSchema);
