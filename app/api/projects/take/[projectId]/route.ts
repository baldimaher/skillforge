import { NextRequest, NextResponse } from "next/server";

import Project from "../../../../../models/Project";
import TakenProject from "../../../../../models/TakenProject";
import dbConnect from "../../../../../lib/mongo";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  await dbConnect();

  try {
    // ATTENTION : await ici pour récupérer les params
    const params = await context.params;
    const { projectId } = params;

    // Valide format ObjectId MongoDB
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: "ID de projet invalide" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId manquant dans la requête" },
        { status: 400 }
      );
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      );
    }

    const alreadyTaken = await TakenProject.findOne({ projectId, userId });
    if (alreadyTaken) {
      return NextResponse.json(
        { error: "Projet déjà pris par cet utilisateur" },
        { status: 409 }
      );
    }

    const takenProject = new TakenProject({
      userId,
      projectId,
      tickets: [],
      startedAt: new Date(),
    });

    await takenProject.save();

    return NextResponse.json({ success: true, takenProject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
