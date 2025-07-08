import { NextRequest, NextResponse } from "next/server";

import TakenProject from "../../../../../models/TakenProject";
import dbConnect from "../../../../../lib/mongo";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  await dbConnect();

  const { userId } = await context.params;
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!userId || !projectId) {
    return NextResponse.json(
      { error: "userId et projectId sont requis" },
      { status: 400 }
    );
  }

  try {
    const takenProject = await TakenProject.findOne({ userId, projectId });

    if (!takenProject) {
      return NextResponse.json(
        { error: "Projet pris non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(takenProject);
  } catch (error) {
    console.error("Erreur GET taken-by-user:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
