// projects/[id]/take/route.ts

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
    const userId = body.userId; // idéalement récupéré via auth

    if (!userId) {
      return NextResponse.json({ message: "Utilisateur non authentifié" }, { status: 401 });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }
    if (project.takenBy) {
      return NextResponse.json({ message: "Projet déjà pris" }, { status: 400 });
    }

    project.takenBy = userId;
    await project.save();

    await User.findByIdAndUpdate(userId, { $addToSet: { projectsTaken: projectId } });

    return NextResponse.json({ message: "Projet pris avec succès" });
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
