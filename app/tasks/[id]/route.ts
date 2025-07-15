import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Project from "@/models/Project";
import Task from "@/models/task";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const params = await context.params;

  await connectDB();

  const tasks = await Task.find({ projectId: params.id });

  if (!tasks) {
    return NextResponse.json({ message: "Aucune tâche trouvée" }, { status: 404 });
  }

  return NextResponse.json(tasks);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const { userId, title, description, priority, hours } = await request.json();

  if (!userId || !title || !params.id) {
    return NextResponse.json(
      { message: "userId, titre et projectId sont obligatoires" },
      { status: 400 }
    );
  }

  const project = await Project.findById(params.id);
  if (!project) {
    return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
  }

  const newTask = new Task({
    userId,
    projectId: params.id,
    title,
    description,
    priority,
    hours,
    status: "todo",
  });

  await newTask.save();

  return NextResponse.json(newTask, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const params = await context.params;
  const data = await request.json();

  await connectDB();

  const updated = await Task.findByIdAndUpdate(params.id, data, { new: true });

  if (!updated) {
    return NextResponse.json({ message: "Tâche non trouvée" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const params = await context.params;

  await connectDB();

  const deleted = await Task.findByIdAndDelete(params.id);

  if (!deleted) {
    return NextResponse.json({ message: "Tâche non trouvée" }, { status: 404 });
  }

  return NextResponse.json({ message: "Tâche supprimée" });
}
