import { NextRequest, NextResponse } from "next/server";

import Quiz from "../../../models/Quiz";
import dbConnect from "../../../lib/mongo";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const quizzes = await Quiz.find({});
    return NextResponse.json(quizzes);
  } catch (error: any) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await dbConnect();
    const quiz = await Quiz.create(body);
    return NextResponse.json(quiz, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
