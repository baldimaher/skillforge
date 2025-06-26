"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Erreur API");
        const data = await res.json();
        setProject(data);
      } catch (error) {
        console.error("Erreur lors de la récupération du projet :", error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProject();
  }, [id]);

  if (loading) return <div className="p-4 text-center">Chargement...</div>;

  if (!project)
    return (
      <div className="p-4 text-center text-red-600">
        Projet introuvable.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white p-6 rounded-xl shadow space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-700">{project.title}</h1>
        <Link href={`/projects/${project._id}/kanban`}>
          <Button>Ouvrir le tableau</Button>
        </Link>
      </div>

      <p className="text-gray-800">{project.description}</p>

      {Array.isArray(project.technologies) && project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech, index) => (
            <Badge key={index} variant="outline">{tech}</Badge>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-500 space-y-1">
        <p><strong>Statut :</strong> {project.status}</p>
        <p><strong>Créé le :</strong> {new Date(project.createdAt).toLocaleDateString()}</p>
        <p><strong>Mis à jour :</strong> {new Date(project.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
