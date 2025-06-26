// projects/[id]/route.ts

import { NextResponse } from "next/server";
import Project from "../../../../models/Project";
import connectDB from "../../../../lib/mongo";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  await connectDB();
  try {
    const project = await Project.findById(params.id).lean();
    if (!project) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  await connectDB();
  try {
    const body = await request.json();

    // TODO: Vérifier l'autorisation (admin ou user autorisé)

    const updatedProject = await Project.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedProject) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }
    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  await connectDB();
  try {
    const deletedProject = await Project.findByIdAndDelete(params.id);
    if (!deletedProject) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }
    return NextResponse.json({ message: "Projet supprimé" });
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
