import Certificate from "../../../../models/Certificate";
import { NextResponse } from "next/server";
import connectDB from "../../../../lib/mongo";

export async function POST(req: Request) {
  try {
    // Connexion à MongoDB
    await connectDB();

    // Récupération des données du corps de la requête
    const data = await req.json();

    // Validation basique
    const { userId, quizId, quizTitle, score, date } = data;
    if (!userId || !quizId || !quizTitle || score === undefined || !date) {
      return NextResponse.json(
        { message: "Champs requis manquants" },
        { status: 400 }
      );
    }

    // Création et sauvegarde du certificat
    const newCertificate = new Certificate({
      userId,
      quizId,
      quizTitle,
      score,
      date: new Date(date),
    });

    await newCertificate.save();

    return NextResponse.json(
      { message: "Certificat créé avec succès", id: newCertificate._id },
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
