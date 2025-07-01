import { NextRequest, NextResponse } from "next/server";

import User from "../../../../../models/User";
import dbConnect from "../../../../../lib/mongo";

export async function POST(req: NextRequest, context: { params: { _id: string } }) {
  await dbConnect();

  const quizId = context.params._id;

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json(
      { message: "Corps de requête invalide (JSON attendu)" },
      { status: 400 }
    );
  }

  const { userId, score, title } = body;

  if (!userId || score === undefined || !title) {
    return NextResponse.json({ message: "Données manquantes" }, { status: 400 });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (!Array.isArray(user.quizzes)) {
      user.quizzes = [];
    }

    const existingAttempt = user.quizzes.find(
      (entry: any) => entry.quiz && entry.quiz.toString() === quizId
    );

    const now = new Date();

    if (existingAttempt) {
      const lastAttemptDate = new Date(existingAttempt.date);
      const diffDays = (now.getTime() - lastAttemptDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays < 7) {
        return NextResponse.json(
          { message: "Vous devez attendre 7 jours avant de refaire ce quiz." },
          { status: 403 }
        );
      }

      // Mise à jour de l'ancienne tentative
      existingAttempt.score = score;
      existingAttempt.date = now;
    } else {
      // Ajout d'une nouvelle tentative
      user.quizzes.push({
        quiz: quizId,
        title,
        score,
        date: now,
      });
    }

    await user.save();

    return NextResponse.json({ message: "Score sauvegardé avec succès" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Erreur lors de la sauvegarde" }, { status: 500 });
  }
}
