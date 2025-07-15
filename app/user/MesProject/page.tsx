"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Project {
  _id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  technologies: string[];
  objectives: string[];
  status: "en cours" | "terminé" | "à venir";
  takenBy?: string;
}

export default function UserProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProjects = async () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);

      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Erreur lors de la récupération des projets");
        const allProjects: Project[] = await res.json();

        // 🔍 Filtrer uniquement les projets pris par l'utilisateur connecté
        const filteredProjects = allProjects.filter(p => p.takenBy === user._id);

        setProjects(filteredProjects);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Mes projets pris</h1>

      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-slate-500">Aucun projet pris</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <Card key={project._id} className="hover:shadow transition">
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>⏱️ {project.duration}</span>
                  <span>📋 {project.objectives?.length ?? 0} objectifs</span>
                  <span>📌 {project.status}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies?.map((tech, idx) => (
                    <Badge key={idx} variant="outline">{tech}</Badge>
                  ))}
                </div>
                <Badge className={getDifficultyColor(project.difficulty)}>
                  {project.difficulty}
                </Badge>
                <Link href={`/projects/${project._id}`}>
                  <Button className="w-full mt-2">Voir les détails</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
