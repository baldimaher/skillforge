import { NextRequest, NextResponse } from "next/server";

import TakenProject from "../../../../../models/TakenProject";
import dbConnect from "../../../../../lib/mongo";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { takenId: string } }
) {
  await dbConnect();

  try {
    if (!params || !params.takenId) {
      return NextResponse.json({ error: "takenId is missing" }, { status: 400 });
    }
    const { takenId } = params;

    if (!mongoose.Types.ObjectId.isValid(takenId)) {
      return NextResponse.json({ error: "Invalid takenId format" }, { status: 400 });
    }

    const project = await TakenProject.findById(takenId).populate("projectId");
    if (!project) {
      return NextResponse.json({ error: "Projet pris non trouvé" }, { status: 404 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET handler:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}