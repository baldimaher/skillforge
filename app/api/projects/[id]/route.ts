// app/api/projects/[id]/tasks/route.ts
import { NextResponse } from "next/server";
import Task from "@/models/task";
import Project from "@/models/Project"; // Updated import with ProjectDocument
import connectDB from "@/lib/mongo";

interface Params {
  params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
  await connectDB();
  try {
    const project = await Project.findById(params.id).lean();
    if (!project) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error("Erreur récupération projet :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// POST: Créer une nouvelle tâche
export async function POST(request: Request, { params }: Params) {
  await connectDB();
  try {
    const { userId, title, description, priority, hours } = await request.json();
    if (!userId || !title || !params.id) {
      return NextResponse.json(
        { message: "userId, titre et projectId sont obligatoires" },
        { status: 400 }
      );
    }

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }

    if (project.takenBy.toString() !== userId) {
      return NextResponse.json(
        { message: "Vous n'êtes pas autorisé à ajouter des tâches à ce projet" },
        { status: 403 }
      );
    }

    const task = new Task({
      title,
      description: description || "",
      projectId: params.id,
      userId,
      status: "todo",
      priority: priority || "medium",
      hours: hours || 1,
      startDate: null,
      endDate: null,
    });

    await task.save();

    const tasks = await Task.find({ projectId: params.id, userId });
    const allTasksDone = tasks.length > 0 && tasks.every((t) => t.status === "done");
    if (allTasksDone && project.status !== "terminé") {
      project.status = "terminé";
      await project.save();
    }

    return NextResponse.json({ message: "Tâche ajoutée", task: task.toObject() }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la tâche :", error);
    return NextResponse.json(
      { message: "Erreur création tâche", error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}

// PUT: Mettre à jour une tâche
export async function PUT(request: Request, { params }: Params) {
  await connectDB();
  try {
    const { taskId, status, title, description, priority, hours } = await request.json();
    if (!taskId) {
      return NextResponse.json({ message: "taskId est obligatoire" }, { status: 400 });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ message: "Tâche non trouvée" }, { status: 404 });
    }

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }
    if (project.takenBy.toString() !== task.userId.toString()) {
      return NextResponse.json(
        { message: "Vous n'êtes pas autorisé à modifier cette tâche" },
        { status: 403 }
      );
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (hours) task.hours = hours;
    if (status) {
      task.status = status;
      if (status === "doing" && !task.startDate) {
        task.startDate = new Date();
      }
      if (status === "done" && !task.endDate) {
        task.endDate = new Date();
      }
    }
    task.updatedAt = new Date();

    await task.save();

    const tasks = await Task.find({ projectId: params.id, userId: task.userId });
    const allTasksDone = tasks.every((t) => t.status === "done");
    if (allTasksDone && project.status !== "terminé") {
      project.status = "terminé";
      await project.save();
    }

    return NextResponse.json({ message: "Tâche mise à jour", task: task.toObject() });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche :", error);
    return NextResponse.json(
      { message: "Erreur mise à jour tâche", error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}

// DELETE: Supprimer une tâche
export async function DELETE(request: Request, { params }: Params) {
  await connectDB();
  try {
    const { taskId } = await request.json();
    if (!taskId) {
      return NextResponse.json({ message: "taskId est obligatoire" }, { status: 400 });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ message: "Tâche non trouvée" }, { status: 404 });
    }

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
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
    console.error("Erreur lors de la suppression de la tâche :", error);
    return NextResponse.json(
      { message: "Erreur suppression tâche", error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}



