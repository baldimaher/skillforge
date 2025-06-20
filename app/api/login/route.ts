import { NextRequest, NextResponse } from "next/server";

import User from "../../../models/User";
import bcrypt from "bcryptjs";
import dbConnect from "../../../lib/mongo";

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ message: "✅ Connexion MongoDB réussie !" });
  } catch (error) {
    return NextResponse.json({ message: "❌ Connexion MongoDB échouée." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
    }

return NextResponse.json({ success: true, message: "✅ Connexion réussie", user: { email: user.email } });
  } catch (error) {
    console.error("Erreur POST login:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
