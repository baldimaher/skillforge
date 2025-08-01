import "../../../../../models/Certificate";

import { NextRequest, NextResponse } from "next/server";

import Certificate from "@/models/Certificate";
import User from "@/models/User";
import dbConnect from "@/lib/mongo";

// Define the type for params as a Promise
type Params = { params: Promise<{ id: string }> };

export async function GET(
  req: NextRequest,
  { params }: Params // Destructure params from the context
) {
  // Await params to get the id
  const { id } = await params;

  await dbConnect();

  try {
    const user = await User.findById(id).populate("certificates");

    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json(user.certificates || []);
  } catch (error) {
    console.error("Erreur lors de la récupération des certificats:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}