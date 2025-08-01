import { NextResponse } from "next/server";
import Project from "../../../models/Project";
import { Types } from "mongoose";
import connectDB from "../../../lib/mongo";

export async function GET() {
  await connectDB();
  try {
    const projects = await Project.find().lean();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    await connectDB();

    const data = await request.json();

    const {
      title,
      description,
      technologies,
      status,
      difficulty,
      objectives,
      duration,
      githubUrl,
      demoUrl,
      userId,
    } = data;

    // Validation simple
    if (!title || !description) {
      return NextResponse.json(
        { message: "Titre et description sont obligatoires." },
        { status: 400 }
      );
    }

    // Création d'un nouveau projet
    const newProject = new Project({
      title: title.trim(),
      description,
      technologies: Array.isArray(technologies) ? technologies : [],
      status: status || "à venir",
      difficulty,
      objectives,
      duration,
      githubUrl,
      demoUrl,
      userId,
    });

    await newProject.save();

    return NextResponse.json(
      { message: "Projet ajouté avec succès", project: newProject },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'ajout du projet :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}