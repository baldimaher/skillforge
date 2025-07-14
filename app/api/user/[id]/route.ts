import { NextResponse } from "next/server";
import User from "../../../../models/User";
import dbConnect from "../../../../lib/mongo";

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  await dbConnect();

  const { id } = context.params;

  try {
    const user = await User.findById(id)
      .populate("certificates")
      .populate({
        path: "quizzes.quiz",
        model: "Quiz",
      });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
