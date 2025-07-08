"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  status: string;
}

interface Ticket {
  _id?: string;
  title: string;
  description: string;
  status: "À faire" | "En cours" | "Terminé";
}

interface User {
  _id: string;
  email: string;
  lastName: string;
  firstName: string;
  role: string;
  certificates: string[];
  projectsTaken: string[];
  quizzes: any[];
}

interface Props {
  project: Project;
  projectId: string;
}

const DEFAULT_API_URL = "http://localhost:3000"; // Fallback API URL for development

export default function ProjectDetailClient({ project, projectId }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [takenProjectId, setTakenProjectId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticket, setTicket] = useState<Ticket>({
    title: "",
    description: "",
    status: "À faire",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Retrieve user from localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          setError("Veuillez vous connecter pour voir les détails du projet.");
          setLoading(false);
          router.push(`/login?redirect=/project/${projectId}`);
          return;
        }

        let parsedUser: User;
        try {
          parsedUser = JSON.parse(userStr);
          if (!parsedUser?._id) {
            throw new Error("ID utilisateur non trouvé dans localStorage");
          }
          setUserId(parsedUser._id);
        } catch {
          setError("Erreur lors de la lecture des données utilisateur");
          setLoading(false);
          router.push(`/login?redirect=/project/${projectId}`);
          return;
        }

        // Check if projectId is in projectsTaken
        const projectTaken = parsedUser.projectsTaken.includes(projectId);
        if (!projectTaken) {
          setTakenProjectId(null);
          setTickets([]);
          setError("Ce projet n'est pas pris par cet utilisateur.");
          setLoading(false);
          return;
        }

        setTakenProjectId(projectId);

        // Fetch tickets
        const resTickets = await fetch(
          `${apiUrl}/api/projects/taken/${projectId}/tickets`,
          { cache: "no-store" }
        );
        if (!resTickets.ok) throw new Error("Erreur lors de la récupération des tickets");
        const dataTickets = await resTickets.json();
        setTickets(dataTickets || []);
        setError(null);
      } catch (e: any) {
        setError(e.message || "Erreur inconnue");
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, apiUrl, router]);

  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!takenProjectId) {
      setMessage("ID projet pris non trouvé.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/projects/taken/${takenProjectId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticket),
      });

      const newTicket = await res.json();

      if (res.ok) {
        setMessage("Ticket ajouté avec succès !");
        setTicket({ title: "", description: "", status: "À faire" });
        setTickets((prev) => [...prev, newTicket]);
      } else {
        setMessage(newTicket.error || "Erreur lors de l'ajout");
      }
    } catch {
      setMessage("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTicketStatus = async (
    ticketId: string,
    newStatus: "À faire" | "En cours" | "Terminé"
  ) => {
    if (!takenProjectId) {
      setMessage("ID projet pris non trouvé.");
      return;
    }

    try {
      const res = await fetch(
        `${apiUrl}/api/projects/taken/${takenProjectId}/tickets/${ticketId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const updatedTicket = await res.json();

      if (res.ok) {
        setMessage("Statut du ticket mis à jour avec succès !");
        setTickets((prev) =>
          prev.map((t) => (t._id === ticketId ? { ...t, status: newStatus } : t))
        );
      } else {
        setMessage(updatedTicket.error || "Erreur lors de la mise à jour du statut");
      }
    } catch {
      setMessage("Erreur réseau lors de la mise à jour du statut");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center" aria-live="polite">
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <Link
          href="/login"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Détails du projet</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">{project.title}</h2>
        <p className="text-gray-600">{project.description}</p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700">Technologies</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {project.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Tickets existants</h3>
        {tickets.length === 0 ? (
          <p className="text-gray-500">Aucun ticket disponible.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-3 text-left text-gray-700">Titre</th>
                  <th className="border px-4 py-3 text-left text-gray-700">Description</th>
                  <th className="border px-4 py-3 text-left text-gray-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border px-4 py-3 text-gray-600">{t.title}</td>
                    <td className="border px-4 py-3 text-gray-600">{t.description}</td>
                    <td className="border px-4 py-3">
                      <select
                        value={t.status}
                        onChange={(e) =>
                          handleUpdateTicketStatus(
                            t._id!,
                            e.target.value as "À faire" | "En cours" | "Terminé"
                          )
                        }
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          t.status === "À faire"
                            ? "bg-red-100"
                            : t.status === "En cours"
                            ? "bg-yellow-100"
                            : "bg-green-100"
                        }`}
                      >
                        <option value="À faire">À faire</option>
                        <option value="En cours">En cours</option>
                        <option value="Terminé">Terminé</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Ajouter un ticket</h3>
        <form onSubmit={handleAddTicket} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Titre
            </label>
            <input
              id="title"
              type="text"
              placeholder="Titre du ticket"
              value={ticket.title}
              onChange={(e) => setTicket({ ...ticket, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              placeholder="Description du ticket"
              value={ticket.description}
              onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              required
            />
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Statut
            </label>
            <select
              id="status"
              value={ticket.status}
              onChange={(e) =>
                setTicket({
                  ...ticket,
                  status: e.target.value as "À faire" | "En cours" | "Terminé",
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="À faire">À faire</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-4 py-2 text-white rounded-lg transition-colors ${
              isSubmitting
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSubmitting ? "Ajout en cours..." : "Ajouter le ticket"}
          </button>
          {message && (
            <p
              className={`text-sm mt-2 ${
                message.includes("succès") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/project"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retour à la liste des projets
        </Link>
      </div>
    </div>
  );
}