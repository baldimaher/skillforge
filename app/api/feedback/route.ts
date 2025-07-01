import { NextRequest, NextResponse } from "next/server";

import Feedback from "../../../models/Feedback";
import connectDB from "../../../lib/mongo";
import mongoose from "mongoose";

// 🔒 Connecte à la base (si tu as une fonction custom de connexion MongoDB)


// ✅ POST: Ajouter un feedback
export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { userId, comment, rating } = await req.json();
    const feedback = await Feedback.create({ userId, comment, rating });
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'ajout" }, { status: 500 });
  }
}
// ✅ GET: Récupérer tous les feedbacks
export async function GET() {
  await connectDB();

  try {
    const feedbacks = await Feedback.find().populate("userId", "firstName lastName email");
    return NextResponse.json(feedbacks, { status: 200 });
  } catch (error) {
    console.error("Erreur GET feedback:", error);  // <-- ajoute ce log
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const deleted = await Feedback.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Feedback non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Feedback supprimé" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
