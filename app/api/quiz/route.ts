import { NextRequest, NextResponse } from "next/server";

import Quiz from "../../../models/Quiz";
import User from "../../../models/User";
import dbConnect from "../../../lib/mongo";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const userId = req.headers.get("authorization");

    if (userId && userId !== "undefined") {
      // Récupérer les quiz passés par cet utilisateur
      const user = await User.findById(userId).populate("quizzes.quiz");

      if (!user) {
        return NextResponse.json(
          { message: "Utilisateur introuvable" },
          { status: 404 }
        );
      }

      const validQuizzes = user.quizzes.filter((q: { quiz: any }) => q.quiz != null);

      const quizzes = validQuizzes.map((q: { quiz: any; score: any; date: any }) => ({
        _id: q.quiz._id,
        title: q.quiz.title,
        description: q.quiz.description,
        questions: q.quiz.questions,
        timeLimit: q.quiz.timeLimit,
        passingScore: q.quiz.passingScore,
        category: q.quiz.category,
        difficulty: q.quiz.difficulty,
        score: q.score,
        lastAttemptDate: q.date,
        completed: true,
      }));

      return NextResponse.json(quizzes);
    } else {
      // Pas d'userId : retourner tous les quiz disponibles
      const allQuizzes = await Quiz.find({});

      const quizzes = allQuizzes.map((quiz) => ({
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        category: quiz.category,
        difficulty: quiz.difficulty,
      }));

      return NextResponse.json(quizzes);
    }
  } catch (err) {
    console.error("Erreur GET /api/quiz:", err);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des quiz" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const data = await req.json();
    const newQuiz = new Quiz(data);
    await newQuiz.save();

    return NextResponse.json({
      message: "Quiz créé avec succès",
      quiz: newQuiz,
    });
  } catch (error) {
    console.error("Erreur POST /api/quiz:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du quiz" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "ID manquant" }, { status: 400 });
    }

    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) {
      return NextResponse.json({ message: "Quiz non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Quiz supprimé avec succès" });
  } catch (err) {
    console.error("Erreur DELETE /api/quiz:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
