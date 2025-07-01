import Certificate from "../../../../models/Certificate";
import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongo";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  await connectDB();

const { quizId } = await params;

  console.log("Recherche certificat pour quizId :", quizId);

  try {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 });
    }

    const cert = await Certificate.findOne({ quizId }).populate("userId", "firstName lastName");

    if (!cert) {
      return NextResponse.json({ message: "Certificat non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      quizTitle: cert.quizTitle,
      score: cert.score,
      date: cert.date,
      user: {
        firstName: cert.userId?.firstName || "Prénom",
        lastName: cert.userId?.lastName || "Nom",
      },
      pdfUrl: cert.pdfUrl || null,
    });
  } catch (error) {
    console.error("Erreur dans GET certificate:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

