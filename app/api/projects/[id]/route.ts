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

    return NextResponse.json(project);
  } catch (error) {
    console.error("Erreur récupération projet :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}