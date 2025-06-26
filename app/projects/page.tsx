"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// Type pour les projets
interface Project {
  _id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  technologies: string[];
  objectives: string[];
  // autres propriétés...
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        console.log("Fetching projects...");
        const response = await fetch("/api/projects");
        console.log("Response status:", response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`);
        }
        const data = await response.json();
        console.log("Projects data:", data);
        setProjects(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "";
    }
  }

  return (
    <div className="container py-8 mx-auto">
      <h1 className="text-3xl font-bold mb-6">Projets disponibles</h1>
      
      {/* Afficher l'état du chargement et des erreurs */}
      {loading && <div className="text-center py-10">Chargement des projets...</div>}
      {error && <div className="text-center py-10 text-red-500">Erreur: {error}</div>}
      
      {/* Afficher un message si aucun projet n'est trouvé */}
      {!loading && !error && projects.length === 0 && (
        <div className="text-center py-10">
          Aucun projet disponible. Veuillez ajouter des projets à la base de données.
        </div>
      )}
      
      {/* Liste des projets */}
      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="text-base">{project.description}</CardDescription>
                </div>
                <Badge className={getDifficultyColor(project.difficulty)}>{project.difficulty}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>⏱️ {project.duration}</span>
                  <span>📋 {project.objectives.length} objectives</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <Badge key={index} variant="outline">{tech}</Badge>
                  ))}
                </div>
                <Link href={`/projects/${project._id}`}>
                  <Button className="w-full">Voir les détails</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}



