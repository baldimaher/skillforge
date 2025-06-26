"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProjectType {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  status: "en cours" | "terminé" | "à venir";
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Récupérer le user depuis localStorage côté client (verif admin)
  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === "admin";

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Erreur lors de la récupération des projets");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Erreur récupération projets", err);
      setMessage("Erreur lors de la récupération des projets");
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
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setProjects((prev) => prev.filter((p) => p._id !== id));
      setMessage("Projet supprimé avec succès.");
    } catch (err) {
      console.error(err);
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
      fetchProjects(); // rafraichir la liste des projets
    } catch (error: any) {
      setMessage(error.message || "Erreur inconnue");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projets</h1>
          <p className="text-slate-600">Liste des projets en cours ou terminés</p>
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
        <p className="text-center">Chargement...</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-slate-500">Aucun projet trouvé</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project._id} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
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
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, i) => (
                    <Badge key={i} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-slate-600">Statut : {project.status}</div>
                <Link href={`/projects/${project._id}`}>
                  <Button variant="outline" className="mt-2 w-full">
                    Voir le projet
                  </Button>
                </Link>

                {!isAdmin && (
                  <Button
                    variant="secondary"
                    className="mt-2 w-full"
                    onClick={() => handleTakeProject(project._id)}
                  >
                    Prendre ce projet
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {message && <p className="text-red-600 text-center mt-4">{message}</p>}
    </div>
  );
}
