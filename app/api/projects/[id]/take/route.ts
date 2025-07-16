import { NextResponse } from "next/server";
import Project from "@/models/Project";
import User from "@/models/User";
import connectDB from "@/lib/mongo";

interface Params {
  params: { id: string };
}

export async function POST(request: Request, { params }: Params) {
  await connectDB();
  try {
    const { id: projectId } = params;
    const body = await request.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        { message: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return NextResponse.json(
        { message: "Projet non trouvé" },
        { status: 404 }
      );
    }

    // Si le projet est déjà pris par quelqu’un d’autre
    if (project.takenBy && project.takenBy.toString() !== userId) {
      const now = new Date();
      const takenAt = project.takenAt;
      const diffInMs = now.getTime() - new Date(takenAt).getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      if (!takenAt || diffInDays < 7) {
        return NextResponse.json(
          { message: "Projet déjà pris – veuillez réessayer après 7 jours" },
          { status: 403 }
        );
      }
    }

    // Affecter le projet à l'utilisateur
    project.takenBy = userId;
    project.takenAt = new Date();
    await project.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { projectsTaken: projectId },
    });

    return NextResponse.json({ message: "Projet pris avec succès" });
  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}