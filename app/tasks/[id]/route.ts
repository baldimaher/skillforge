import { NextRequest, NextResponse } from "next/server";

import Task from "../../../models/task";
import connectDB from "../../../lib/mongo";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const task = await Task.findById(params.id);
  if (!task) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const data = await req.json();
  const updated = await Task.findByIdAndUpdate(params.id, data, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  await Task.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Tâche supprimée" });
}
