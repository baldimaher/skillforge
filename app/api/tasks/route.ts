import { NextResponse } from "next/server";
import Task from "../../../models/task";
import connectDB from "../../../lib/mongo";

// GET: récupérer toutes les tâches
export async function GET() {
  try {
    await connectDB();
    const tasks = await Task.find();
    return NextResponse.json(tasks);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Erreur serveur", error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "Erreur serveur inconnue" },
      { status: 500 }
    );
  }
}

// POST: créer une tâche
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.title || !body.projectId) {
      return NextResponse.json({ message: "Champs manquants" }, { status: 400 });
    }

    const task = await Task.create(body);
    return NextResponse.json(task);
  } catch (error: unknown) {
    console.error("Erreur dans POST /api/tasks:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ message: "Erreur création tâche", error: message }, { status: 500 });
  }
}
