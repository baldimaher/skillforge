// /api/quiz/route.ts

import { NextRequest, NextResponse } from "next/server";

import Quiz from "../../../models/Quiz";
import User from "../../../models/User";
import dbConnect from "../../../lib/mongo";

export async function GET(req: NextRequest) {
  await dbConnect();

  const userStr = req.headers.get("authorization"); // Token ou ID (à adapter à ton auth)
  const userId = userStr; // Pour simplifier ici

  const quizzes = await Quiz.find();
  const user = await User.findById(userId);

  const result = quizzes.map((quiz) => {
    const attempt = user?.quizzes?.find((q: any) => q.quiz.toString() === quiz._id.toString());
    return {
      ...quiz.toObject(),
      completed: !!attempt,
      score: attempt?.score || null,
      lastAttemptDate: attempt?.date || null,
    };
  });

  return NextResponse.json(result);
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const quiz = await Quiz.findByIdAndDelete(params.id);
    if (!quiz) {
      return NextResponse.json({ message: "Quiz non trouvé" }, { status: 404 });
    }
    return NextResponse.json({ message: "Quiz supprimé avec succès" });
  } catch (err) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
export async function POST(req: { json: () => any; }) {
  await dbConnect();

  try {
    const data = await req.json();

    // Crée un nouveau quiz avec les données reçues (titre, questions, etc.)
    const newQuiz = new Quiz(data);
    await newQuiz.save();

    return NextResponse.json({ message: "Quiz créé avec succès", quiz: newQuiz });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur lors de la création du quiz" }, { status: 500 });
  }
}