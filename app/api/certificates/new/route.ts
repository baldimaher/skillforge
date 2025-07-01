import Certificate from "../../../../models/Certificate";
import { NextResponse } from "next/server";
import User from "../../../../models/User";
import connectDB from "../../../../lib/mongo";

export async function POST(req: Request) {
  try {
    await connectDB();

    const data = await req.json();

    const { userId, quizId, quizTitle, score, date, pdfUrl } = data;

    if (!userId || !quizId || !quizTitle || score === undefined || !date) {
      return NextResponse.json(
        { message: "Champs requis manquants" },
        { status: 400 }
      );
    }

    // Création du certificat
    const newCertificate = new Certificate({
      userId,
      quizId,
      quizTitle,
      score,
      date: new Date(date),
      pdfUrl,
    });

    await newCertificate.save();

    // Mise à jour de l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { certificates: newCertificate._id } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé pour mise à jour" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Certificat créé et utilisateur mis à jour avec succès", id: newCertificate._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Erreur création certificat :", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
