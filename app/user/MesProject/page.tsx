"use client";

import {
  AlertTriangle,
  Bookmark,
  CircleCheck,
  Clock,
  ListChecks,
  Rocket,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const getDifficultyStyle = (difficulty: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "en cours":
        return <Rocket className="w-4 h-4 text-blue-500" />;
      case "terminé":
        return <CircleCheck className="w-4 h-4 text-green-500" />;
      case "à venir":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bookmark className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">📁 Mes projets pris</h1>

      {loading ? (
        <p className="text-center text-gray-500">Chargement...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-gray-400">Aucun projet pris pour le moment.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <Card
              key={project._id}
              className="hover:shadow-lg transition duration-300 border border-gray-200"
            >
              <CardHeader>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {project.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <ListChecks className="w-4 h-4" /> {project.objectives.length} objectifs
                  </span>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(project.status)} {project.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, idx) => (
                    <Badge key={idx} variant="outline" className="capitalize">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <Badge className={`inline-block ${getDifficultyStyle(project.difficulty)}`}>
                  Difficulté : {project.difficulty}
                </Badge>

                <Link href={`/projects/${project._id}`}>
                  <Button className="w-full mt-3">Voir les détails</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
