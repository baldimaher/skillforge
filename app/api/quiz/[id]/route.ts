import { NextRequest, NextResponse } from "next/server";

import Quiz from "../../../../models/Quiz";
import dbConnect from "../../../../lib/mongo";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const quiz = await Quiz.findById(params.id);
    if (!quiz) return NextResponse.json({ message: "Quiz non trouvé" }, { status: 404 });
    return NextResponse.json(quiz);
  } catch (error: any) {
    console.error("GET /api/quiz/[id] error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await dbConnect();
    const quiz = await Quiz.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!quiz) return NextResponse.json({ message: "Quiz non trouvé" }, { status: 404 });
    return NextResponse.json(quiz);
  } catch (error: any) {
    console.error("PUT /api/quiz/[id] error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const quiz = await Quiz.findByIdAndDelete(params.id);
    if (!quiz) return NextResponse.json({ message: "Quiz non trouvé" }, { status: 404 });
    return NextResponse.json({ message: "Quiz supprimé avec succès" });
  } catch (error: any) {
    console.error("DELETE /api/quiz/[id] error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
