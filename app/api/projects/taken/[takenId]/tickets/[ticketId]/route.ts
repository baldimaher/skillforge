import { NextRequest, NextResponse } from "next/server";

import TakenProject from "../../../../../../../models/TakenProject";
import dbConnect from "../../../../../../../lib/mongo";

// ✅ PATCH : mise à jour du statut d’un ticket spécifique
export async function PATCH(
  request: NextRequest,
  context: { params: { takenId: string; ticketId: string } }
) {
  await dbConnect();

  const { takenId, ticketId } = context.params;

  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !["À faire", "En cours", "Terminé"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const taken = await TakenProject.findById(takenId);
    if (!taken) {
      return NextResponse.json({ error: "Projet pris non trouvé" }, { status: 404 });
    }

    const ticket = taken.tickets.id(ticketId);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket non trouvé" }, { status: 404 });
    }

    ticket.status = status;
    await taken.save();

    return NextResponse.json({ message: "Statut mis à jour", ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
