"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  status: "en cours" | "terminé" | "à venir";
  createdAt: string;
  updatedAt: string;
  takenBy?: string;
  // autres propriétés...
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userStr =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === "admin";

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Erreur lors de la récupération des projets");
      const data = await res.json();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce projet ?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setProjects((prev) => prev.filter((p) => p._id !== id));
      setMessage("Projet supprimé avec succès.");
    } catch (err) {
      setMessage("Erreur lors de la suppression du projet.");
    }
  };

  const handleTakeProject = async (projectId: string) => {
    if (!user) {
      setMessage("Veuillez vous connecter pour prendre un projet.");
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/take`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      setMessage("Projet pris avec succès !");
      fetchProjects();
    } catch (error: any) {
      setMessage(error.message || "Erreur inconnue");
    }
  };
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
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projets disponibles</h1>
          <p className="text-slate-600">
            Liste des projets en cours, terminés ou à venir
          </p>
        </div>
        {isAdmin && (
          <Link href="/projects/new">
            <Button className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Lancer un projet
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-center">Chargement des projets...</p>
      ) : error ? (
        <p className="text-center text-red-500">Erreur : {error}</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-slate-500">Aucun projet trouvé</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getDifficultyColor(project.difficulty)}>
                      {project.difficulty}
                    </Badge>
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(project._id)}
                        aria-label="Supprimer le projet"
                      >
                        <Trash2 className="text-red-600 w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>⏱️ {project.duration}</span>
                  <span>📋 {project.objectives?.length ?? 0} objectifs</span>
                  <span>📌 Statut : {project.status}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <Badge key={index} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <Link href={`/projects/${project._id}`}>
                  <Button className="w-full">Voir les détails</Button>
                </Link>

                {/* === LOGIQUE BOUTON SELON L'ÉTAT DU PROJET === */}
                {!isAdmin && (
                  <>
                    {project.takenBy === user?._id ? (
                      <Button variant="secondary" className="w-full" disabled>
                        ✅ Projet déjà pris par vous
                      </Button>
                    ) : project.takenBy && project.takenBy !== user?._id ? (
                      <Button variant="destructive" className="w-full" disabled>
                        ❌ Projet pris par un autre – revient après 7 jours
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => handleTakeProject(project._id)}
                      >
                        🎯 Prendre ce projet
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {message && <p className="text-red-600 text-center mt-4">{message}</p>}
    </div>
  );
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



