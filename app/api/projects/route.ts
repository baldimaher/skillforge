import { NextRequest, NextResponse } from "next/server";

import Project from "@/models/Project";
import dbConnect from "@/lib/mongo";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  duration: z.string().min(1, "Duration is required"),
  technologies: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  resources: z.array(z.string()).optional(),
  githubUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
});

export async function GET() {
  try {
    console.log("API: Connecting to database...");
    await dbConnect();
    console.log("API: Fetching projects...");
    const projects = await Project.find({}).sort({ createdAt: -1 }).lean();
    console.log(`API: Found ${projects.length} projects`);
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error("Erreur GET /api/projects:", error.message);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("API: POST request received");
    await dbConnect();
    const body = await req.json();
    console.log("API: Request body:", body);
    
    const validatedData = projectSchema.parse(body);
    console.log("API: Data validated successfully");

    const project = await Project.create(validatedData);
    console.log("API: Project created with ID:", project._id);
    
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST /api/projects:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}


