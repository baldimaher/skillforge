import { NextResponse } from "next/server";
import Project from "../../../../models/Project";
import connectDB from "../../../../lib/mongo";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Use Promise for params
) {
  await connectDB();

  try {
    const { id } = await params; // Await the params object
    const project = await Project.findById(id).lean();

    if (!project) {
      return NextResponse.json(
        { message: "Projet non trouvé" },
        { status: 404 }
      );
    }
    if (project.takenBy.toString() !== task.userId.toString()) {
      return NextResponse.json(
        { message: "Vous n'êtes pas autorisé à supprimer cette tâche" },
        { status: 403 }
      );
    }

    await Task.findByIdAndDelete(taskId);

    const tasks = await Task.find({ projectId: params.id, userId: task.userId });
    const allTasksDone = tasks.every((t) => t.status === "done");
    if (allTasksDone && project.status !== "terminé") {
      project.status = "terminé";
      await project.save();
    } else if (!tasks.length && project.status === "terminé") {
      project.status = "en cours"; // Revert to "en cours" if no tasks remain
      await project.save();
    }

    return NextResponse.json({ message: "Tâche supprimée" });
  } catch (error) {
    console.error("Erreur récupération projet :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}