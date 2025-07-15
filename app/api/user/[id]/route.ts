// app/api/user/[id]/route.ts

import { NextRequest } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/mongo";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const { id } = params;

  try {
    const user = await User.findById(id);
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
