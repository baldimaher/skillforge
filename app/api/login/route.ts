import { NextRequest, NextResponse } from "next/server";

import User from "@/models/User";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongo";

export async function POST(request: Request) {
  await dbConnect();

  const { email, password } = await request.json();

  console.log("Email reçu :", email);
  console.log("Mot de passe reçu :", password);

  if (!email || !password) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return NextResponse.json({ success: false, message: "Utilisateur non trouvé" }, { status: 401 });
  }

  const isMatch = await user.comparePassword(password);
  console.log("Mot de passe correct ?", isMatch);

  if (!isMatch) {
    return NextResponse.json({ success: false, message: "Mot de passe incorrect" }, { status: 401 });
  }

  // 🔒 Vérification si l'utilisateur est approuvé, uniquement si role === "user"
  if (user.role === "user" && !user.isApproved) {
    return NextResponse.json(
      {
        success: false,
        message: "Votre compte est en attente d'approbation par un administrateur.",
      },
      { status: 403 }
    );
  }

  const userSafe = user.toObject();
  delete userSafe.password;

  return NextResponse.json({ success: true, user: userSafe });
}

export async function GET() {
  return NextResponse.json({ error: "Méthode GET non autorisée" }, { status: 405 });
}
