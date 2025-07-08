import { NextRequest, NextResponse } from "next/server";

import Project from "../../../models/Project";
import dbConnect from "../../../lib/mongo";

export async function GET() {
  await dbConnect();
  try {
    const projects = await Project.find();
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const body = await request.json();
    const project = new Project(body);
    await project.save();
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
