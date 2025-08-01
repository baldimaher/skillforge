import { NextRequest, NextResponse } from "next/server";

import User from "../../../models/User";
import dbConnect from "../../../lib/mongo"; // adapte le chemin

// adapte le chemin

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      email: user.email,
      passwordHash: user.password,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
