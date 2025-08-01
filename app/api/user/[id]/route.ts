// app/api/user/[id]/route.ts

import "@/models/Certificate";

import { NextRequest } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/mongo";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  await dbConnect();

  try {
    const { id } = context.params;

    const user = await User.findById(id)
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
      return new Response("Utilisateur non trouvé", { status: 404 });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erreur GET /api/user/[id]", error);
    return new Response("Erreur serveur", { status: 500 });
  }
}
