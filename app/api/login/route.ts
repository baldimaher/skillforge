import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

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

    return NextResponse.json({
      success: true,
      message: "✅ Connexion réussie",
      user: {
        _id: user._id.toString(),
        email: user.email,
        lastName: user.lastName,
        firstName: user.firstName,
        role: user.role,
        projectsTaken: user.projectsTaken,
        quizzes: user.quizzes,
        certificates: user.certificates,
      },
    });

  } catch (error) {
    console.error("❌ Erreur POST login:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


export async function GET() {
  return NextResponse.json({ error: "Méthode GET non autorisée" }, { status: 405 });
}
