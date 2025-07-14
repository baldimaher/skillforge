import { NextResponse } from "next/server";
import Project from "@/models/Project";
import Task from "@/models/task";
import dbConnect from "@/lib/mongo";

interface Params {
  params: { id: string };
}
export async function POST(req: Request, context: Params) {
  await dbConnect();

  try {
    const { id } = context.params;
    const { userId } = await req.json();

    if (!userId || !id) {
      return NextResponse.json({ message: "userId et id requis" }, { status: 400 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }

    if (project.takenBy.toString() !== userId) {
      return NextResponse.json(
        { message: "Vous n'êtes pas autorisé à marquer ce projet comme terminé" },
        { status: 403 }
      );
    }

    const tasks = await Task.find({ projectId: id, userId });
    const allTasksDone = tasks.every((task) => task.status === "done");

    if (!allTasksDone) {
      return NextResponse.json(
        { message: "Toutes les tâches ne sont pas terminées" },
        { status: 400 }
      );
    }

    project.status = "terminé";
    await project.save();

    return NextResponse.json({
      message: "Projet marqué comme terminé",
      project,
    });
  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json(
      {
        message: "Erreur serveur",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}