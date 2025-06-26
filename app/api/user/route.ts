// user/route.ts

import { NextRequest, NextResponse } from "next/server";

import User from "../../../models/User";
import dbConnect from "../../../lib/mongo";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email manquant." }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
    }

    return NextResponse.json({
      skills: user.skills || [],
      cvUrl: user.cvUrl || null,
    });
  } catch (err) {
    console.error("Erreur dans /api/user :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
