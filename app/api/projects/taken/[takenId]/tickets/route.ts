import { NextRequest, NextResponse } from "next/server";

import TakenProject from "../../../../../../models/TakenProject";
import dbConnect from "../../../../../../lib/mongo";
import mongoose from "mongoose";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ takenId: string }> }
) {
  await dbConnect();

  const params = await context.params;
  const takenId = params.takenId;

  if (!takenId || !isValidObjectId(takenId)) {
    return NextResponse.json({ error: "takenId invalide ou manquant" }, { status: 400 });
  }

  const taken = await TakenProject.findById(takenId);
  if (!taken) {
    return NextResponse.json({ error: "Projet pris non trouvé" }, { status: 404 });
  }

  return NextResponse.json(taken.tickets || []);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ takenId: string }> }
) {
  await dbConnect();

  const params = await context.params;
  const takenId = params.takenId;

  if (!takenId || !isValidObjectId(takenId)) {
    return NextResponse.json({ error: "takenId invalide ou manquant" }, { status: 400 });
  }

  const ticket = await request.json();

  if (!ticket.title || !ticket.description || !ticket.status) {
    return NextResponse.json(
      { error: "Le ticket doit contenir title, description et status" },
      { status: 400 }
    );
  }

  const taken = await TakenProject.findById(takenId);
  if (!taken) {
    return NextResponse.json({ error: "Projet pris non trouvé" }, { status: 404 });
  }

  taken.tickets.push(ticket);
  await taken.save();

  return NextResponse.json(ticket, { status: 201 });
}
