import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/mongo";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  await connectDB();
  try {
    const user = await User.findById(params.id).lean();
    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Retourner les données utilisateur sans le mot de passe
    const { password, ...userData } = user;
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
