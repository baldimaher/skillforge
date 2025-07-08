"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  status: string;
}

function TakeProjectButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleTake = async () => {
    const user = localStorage.getItem("user");
    if (!user) {
      setMessage("Vous devez être connecté(e) pour prendre un projet.");
      return;
    }
    const userId = JSON.parse(user)._id;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/projects/take/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Projet pris avec succès !");
      } else {
        setMessage(data.error || "Erreur lors de la prise du projet.");
      }
    } catch {
      setMessage("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleTake}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {loading ? "Chargement..." : "Prendre ce projet"}
      </button>
      {message && <p className="mt-2 text-sm text-red-600">{message}</p>}
    </div>
  );
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setError("Une erreur est survenue lors du chargement des projets.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Projects</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {project.title}
            </h2>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.map((tech, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span
                className={`text-sm font-medium px-2.5 py-0.5 rounded ${
                  project.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : project.status === "In Progress"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {project.status}
              </span>
              <Link
                href={`/project/${project._id}`}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Voir le projet
              </Link>
              <TakeProjectButton projectId={project._id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
