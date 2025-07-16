import { NextRequest, NextResponse } from "next/server";

import User from "../../../models/User";
import Certificate from "@/models/Certificate";
import dbConnect from "../../../lib/mongo";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email manquant." }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
    }

    let totalUsers;
    if (user.role === "admin") {
      totalUsers = await User.countDocuments();
    }

    return NextResponse.json({
      skills: user.skills || [],
      cvUrl: user.cvUrl || null,
      ...(user.role === "admin" && { totalUsers }),
    });
  } catch (err) {
    console.error("Erreur dans /api/user :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }}
export async function GET(req: NextRequest, { params }: { params: { _id: string } }) {
  try {
    await dbConnect();

    const user = await User.findById(params._id).populate("certificates");
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

