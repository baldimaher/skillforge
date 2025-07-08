import { NextRequest, NextResponse } from "next/server";

import User from "../../../../../models/User"; // ou Certificate selon besoin
import dbConnect from "../../../../../lib/mongo";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = await context; 
  const { id } = params;

  await dbConnect();

  try {
    const user = await User.findById(id).populate("certificates");

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    if (!user.certificates || user.certificates.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(user.certificates);
  } catch (error) {
    console.error("Erreur lors de la récupération des certificats:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
