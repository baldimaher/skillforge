import { NextRequest, NextResponse } from "next/server";

import ProjectStep from "../../../../../../models/ProjectStep";
import dbConnect from "../../../../../../lib/mongo";
import { z } from "zod";

// Schéma de validation pour la mise à jour
const updateStepSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "doing", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  hours: z.number().min(0.5).optional(),
  actualHours: z.number().min(0).optional(),
  notes: z.string().optional(),
  order: z.number().optional(),
});

// GET /api/projects/[id]/steps/[stepId] - Récupérer une étape spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    await dbConnect();
    const { id, stepId } = await params;

    const step = await ProjectStep.findOne({
      _id: stepId,
      projectId: id,
    }).lean();

    if (!step) {
      return NextResponse.json(
        { message: "Étape non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(step);
  } catch (error: any) {
    console.error("Erreur GET /api/projects/[id]/steps/[stepId]:", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]/steps/[stepId] - Mettre à jour une étape
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    await dbConnect();
    const { id, stepId } = await params;
    const body = await req.json();

    // Valider les données
    const validatedData = updateStepSchema.parse(body);

    // Mettre à jour l'étape
    const step = await ProjectStep.findOneAndUpdate(
      { _id: stepId, projectId: id },
      validatedData,
      { new: true, runValidators: true }
    );

    if (!step) {
      return NextResponse.json(
        { message: "Étape non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(step);
  } catch (error: any) {
    console.error("Erreur PUT /api/projects/[id]/steps/[stepId]:", error);

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

// DELETE /api/projects/[id]/steps/[stepId] - Supprimer une étape
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    await dbConnect();
    const { id, stepId } = await params;

    const step = await ProjectStep.findOneAndDelete({
      _id: stepId,
      projectId: id,
    });

    if (!step) {
      return NextResponse.json(
        { message: "Étape non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Étape supprimée avec succès" });
  } catch (error: any) {
    console.error("Erreur DELETE /api/projects/[id]/steps/[stepId]:", error);
    return NextResponse.json(
      { message: "Erreur serveur", error: error.message },
      { status: 500 }
    );
  }
}