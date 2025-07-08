import Link from "next/link";
import ProjectDetailClient from "./ProjectDetailClient";
import { notFound } from "next/navigation";

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  status: string;
}

const DEFAULT_API_URL = "http://localhost:3000"; // Fallback API URL for development

async function fetchProject(projectId: string): Promise<Project> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn(
      `Environment variable NEXT_PUBLIC_API_URL is not defined. Using fallback: ${DEFAULT_API_URL}`
    );
  }
  const res = await fetch(`${apiUrl}/api/projects/${projectId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Projet non trouvé");
  return res.json();
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // Await params to resolve the Promise
  const projectId = resolvedParams.id;

  if (!projectId || typeof projectId !== "string") {
    notFound();
  }

  try {
    const project = await fetchProject(projectId);

    return <ProjectDetailClient project={project} projectId={projectId} />;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-600 font-medium mb-4">{errorMessage}</p>
        <Link
          href="/project"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retour aux projets
        </Link>
      </div>
    );
  }
}