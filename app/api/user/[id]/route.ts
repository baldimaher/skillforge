import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import User from "@/models/User";
import "@/models/Certificate"; // ✅ NE PAS OUBLIER CETTE LIGNE

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const user = await User.findById(params.id)
      .populate("certificates")
      .populate({
        path: "quizzes.quiz",
        select: "title category description",
      })
      .populate({
        path: "projectsTaken",
        select: "title difficulty status technologies",
      });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("Erreur GET /api/user/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
