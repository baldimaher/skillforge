import Certificate from "../../../../models/Certificate";
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongo";

export async function GET() {
  try {
    await dbConnect();
    const totalCertificates = await Certificate.countDocuments();
    return NextResponse.json({ totalCertificates });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
