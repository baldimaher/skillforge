import { NextRequest, NextResponse } from "next/server";

import Quiz from "../../../../../models/Quiz";
import User from "../../../../../models/User";
import dbConnect from "../../../../../lib/mongo";

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const quizId = context.params.id;

  const body = await req.json();

  await dbConnect();

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz non trouvé" }, { status: 404 });
  }

  const user = await User.findById(body.userId);
  if (!user) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  if (!Array.isArray(user.quizResults)) {
    user.quizResults = [];
  }

  const passed = body.score >= (quiz.passingScore ?? 0);

  const existingResultIndex = user.quizResults.findIndex(
    (r: { quiz: { toString: () => string } }) => r.quiz.toString() === quizId
  );

  if (existingResultIndex >= 0) {
    user.quizResults[existingResultIndex].score = body.score;
    user.quizResults[existingResultIndex].completedAt = new Date();
    user.quizResults[existingResultIndex].passed = passed;
    user.quizResults[existingResultIndex].answers = body.answers || [];
  } else {
    user.quizResults.push({
      quiz: quiz._id,
      score: body.score,
      completedAt: new Date(),
      passed,
      answers: body.answers || [],
    });
  }

  await user.save();

  return NextResponse.json({
    success: true,
    score: body.score,
    passed,
  });
}
