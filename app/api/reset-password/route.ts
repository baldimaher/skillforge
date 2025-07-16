import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { token, password } = await req.json();

    console.log("Token reçu :", token);
    console.log("Password reçu :", password);

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Token invalide ou expiré");
      return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 400 });
    }

    // ✅ Hash du mot de passe avec bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    user.salt = undefined; // plus besoin de salt avec bcrypt

    await user.save();
    console.log("✅ Mot de passe mis à jour avec succès");

    return NextResponse.json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error("❌ Erreur reset-password:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Méthode GET non autorisée" }, { status: 405 });
}
