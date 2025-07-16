import { NextRequest, NextResponse } from "next/server";

import User from "../../../models/User";
import dbConnect from "../../../lib/mongo";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { token, password } = await req.json();

    console.log("Token reçu :", token);

    // Validation des données
    if (!token || !password) {
      return NextResponse.json({ error: "Token et mot de passe requis." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
    }

    // Recherche de l'utilisateur avec token valide
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Token invalide ou expiré");
      return NextResponse.json({ error: "Token invalide ou expiré." }, { status: 400 });
    }

    // Ne PAS hasher manuellement ici, laisse le middleware pre('save') le faire
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    console.log("✅ Mot de passe mis à jour avec succès");

    return NextResponse.json({ message: "Mot de passe réinitialisé avec succès." });

  } catch (error) {
    console.error("❌ Erreur reset-password:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la réinitialisation." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Méthode GET non autorisée" }, { status: 405 });
}
