import "../../../models/User"; // juste pour forcer l'enregistrement du modèle User
import Feedback from "../../../models/Feedback";
import mongoose from "mongoose";
import connectDB from "../../../lib/mongo";
import { NextRequest, NextResponse } from "next/server";

// ... reste de ton code


export async function GET() {
  await connectDB();

  try {
    const feedbacks = await Feedback.find()
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });
    return NextResponse.json(feedbacks, { status: 200 });
  } catch (error) {
    console.error("Erreur GET feedback:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST: Ajouter un feedback
export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { userId, comment, rating } = await req.json();
    const feedback = await Feedback.create({ userId, comment, rating });
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Erreur POST feedback:", error);
    return NextResponse.json({ error: "Erreur lors de l'ajout" }, { status: 500 });
  }
}
// DELETE: Supprimer un feedback par ID
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
    console.error("Erreur DELETE feedback:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT: Modifier un feedback par ID
export async function PUT(req: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const { comment, rating } = await req.json();

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { comment, rating },
      { new: true }
    );

    if (!updatedFeedback) {
      return NextResponse.json({ error: "Feedback non trouvé" }, { status: 404 });
    }

    return NextResponse.json(updatedFeedback, { status: 200 });
  } catch (error) {
    console.error("Erreur PUT feedback:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
