// app/api/projects/[id]/complete/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Project from "@/models/Project";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }

    project.status = "terminé";
    await project.save();

    return NextResponse.json({
      message: "Projet marqué comme terminé",
      project,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du projet :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
