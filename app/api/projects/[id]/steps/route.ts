import { NextRequest, NextResponse } from "next/server";

import Project from "../../../../../models/Project";
import ProjectStep from "../../../../../models/ProjectStep";
import dbConnect from "../../../../../lib/mongo";
import { z } from "zod";

// Schéma de validation pour les étapes
const stepSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  status: z.enum(["todo", "doing", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  hours: z.number().min(0.5, "Minimum 0.5 heure"),
  actualHours: z.number().min(0).optional(),
  notes: z.string().optional(),
  order: z.number().optional(),
});

// GET /api/projects/[id]/steps
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }

    const steps = await ProjectStep.find({ projectId: id })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return NextResponse.json(steps);
  } catch (error: any) {
    console.error("Erreur GET /api/projects/[id]/steps:", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/steps
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await req.json();

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }

    const validatedData = stepSchema.parse(body);

    if (validatedData.order === undefined) {
      const lastStep = await ProjectStep.findOne({ projectId: id })
        .sort({ order: -1 })
        .lean<{ order?: number }>(); // Typage ici

      validatedData.order = lastStep?.order !== undefined ? lastStep.order + 1 : 1;
    }

    const step = await ProjectStep.create({
      ...validatedData,
      projectId: id,
    });

    return NextResponse.json(step, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST /api/projects/[id]/steps:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Erreur de validation", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Erreur serveur", error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]/steps
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const { steps } = await req.json();

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: "Projet non trouvé" }, { status: 404 });
    }

    const updatePromises = steps.map((step: any, index: number) =>
      ProjectStep.findByIdAndUpdate(step._id, { order: index + 1 }, { new: true })
    );

    const updatedSteps = await Promise.all(updatePromises);

    return NextResponse.json(updatedSteps);
  } catch (error: any) {
    console.error("Erreur PUT /api/projects/[id]/steps:", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: error.message },
      { status: 500 }
    );
  }
}
