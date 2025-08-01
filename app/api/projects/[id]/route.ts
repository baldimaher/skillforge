import { NextResponse } from "next/server";
import Project from "../../../../models/Project";
import connectDB from "../../../../lib/mongo";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await connectDB();

    // Extraire l'id de l'URL
    const url = new URL(req.url);
    const paths = url.pathname.split("/");
    const id = paths[paths.length - 1]; // dernier segment, soit l'id

    console.log("ID reçu dans API :", id);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Erreur dans API projects/[id] :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}