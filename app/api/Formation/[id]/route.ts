// app/api/Formation/route.ts
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongo";
import Formation from "../../../../models/Formation";

export async function GET() {
  try {
    await dbConnect();
    const formations = await Formation.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(formations);
  } catch (error) {
    console.error("Erreur GET /api/Formation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
