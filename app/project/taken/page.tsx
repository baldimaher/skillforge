"use client";

import { useEffect, useState } from "react";

function TakeProjectButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [taken, setTaken] = useState(false);

  useEffect(() => {
    const checkIfTaken = async () => {
      const user = localStorage.getItem("user");
      if (!user) return;

      try {
        const userId = JSON.parse(user)._id;

        const res = await fetch("/api/projects/taken-by-user");
        if (!res.ok) throw new Error("Erreur récupération projets pris");

        const takenProjects = await res.json();

        // Vérifier si le projet courant est déjà pris
        const isTaken = takenProjects.some(
          (tp: any) => tp.projectId._id === projectId
        );

        if (isTaken) {
          setTaken(true);
          setMessage("Projet déjà pris");
        }
      } catch (error) {
        // Optionnel : gérer erreur fetch
        console.error(error);
      }
    };

    checkIfTaken();
  }, [projectId]);

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
        setTaken(true); // bloquer le bouton après succès
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
        disabled={loading || taken}
        className={`px-4 py-2 rounded text-white ${
          taken
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Chargement..." : taken ? "Projet déjà pris" : "Prendre ce projet"}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${taken ? "text-gray-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default TakeProjectButton;
