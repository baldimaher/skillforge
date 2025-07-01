import { NextRequest, NextResponse } from "next/server";

import Certificate from "../../../models/Certificate";
import connectDB from "../../../lib/mongo";

export async function GET(
  req: NextRequest,
  context: { params: { userId: string } }
) {
  await connectDB();

  const { userId } = context.params;

  try {
    const certificates = await Certificate.find({ userId });

    if (!certificates || certificates.length === 0) {
      return NextResponse.json({ message: "Aucun certificat trouvé" }, { status: 404 });
    }

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Erreur récupération certificats:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
