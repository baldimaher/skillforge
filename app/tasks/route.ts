import { NextResponse } from "next/server";
import Task from "../../models/task";
import connectDB from "../../lib/mongo";

export async function GET() {
  await connectDB();
  const tasks = await Task.find();
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const task = await Task.create(body);
  return NextResponse.json(task);
}

