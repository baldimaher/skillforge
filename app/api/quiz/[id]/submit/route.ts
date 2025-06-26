import { NextRequest, NextResponse } from "next/server";

import User from "../../../../../models/User";
import dbConnect from "../../../../../lib/mongo";

export async function POST(req: NextRequest, context: { params: Promise<{ _id: string }> }) {
  await dbConnect();

  const params = await context.params;
  const quizId = params._id;

  const { userId, score, answers } = await req.json(); // Remplace `title` par `answers` si nécessaire

  try {
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (!Array.isArray(user.quizzes)) {
      user.quizzes = [];
    }

    const existingAttempt = user.quizzes.find((entry: any) =>
      entry.quiz && entry.quiz.toString() === quizId
    );

    if (existingAttempt) {
      const lastAttemptDate = new Date(existingAttempt.date);
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      if (lastAttemptDate > sevenDaysAgo) {
        return NextResponse.json(
          { message: "Vous devez attendre 7 jours avant de refaire ce quiz." },
          { status: 403 }
        );
      }
    }

    user.quizzes.push({
      quiz: quizId,
      score,
      date: new Date(),
    });

    await user.save();

    return NextResponse.json({ message: "Score sauvegardé avec succès" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Erreur lors de la sauvegarde" }, { status: 500 });
  }
}