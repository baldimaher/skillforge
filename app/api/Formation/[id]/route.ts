import Formation from "../../../../models/Formation";
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongo";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const formation = await Formation.findById(params.id).lean();
    if (!formation) return NextResponse.json({ error: "Formation non trouvée" }, { status: 404 });
    return NextResponse.json(formation);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
