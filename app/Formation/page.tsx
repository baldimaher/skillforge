"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

type FormationType = {
  _id: string;
  title: string;
  description: string;
  photoUrl?: string;
  videoUrl?: string;
};

export default function FormationPage() {
  const [formations, setFormations] = useState<FormationType[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/Formation")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur de chargement");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setFormations(data);
        } else {
          setError("Données invalides.");
        }
      })
      .catch((err) => {
        console.error("Erreur chargement formations:", err);
        setError("Erreur lors du chargement des formations.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleVoirDetail = (id: string) => {
    router.push(`/Formation/${id}`);
  };

  if (loading) {
    return <p className="text-center mt-6">Chargement des formations...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Nos Formations</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        {formations.map((formation) => (
          <div key={formation._id} className="bg-white shadow-md rounded-xl overflow-hidden">
            {formation.photoUrl && (
              <img
                src={formation.photoUrl}
                alt={formation.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4 space-y-2">
              <h2 className="text-xl font-semibold text-indigo-600">{formation.title}</h2>
              <p className="text-gray-700 line-clamp-3">{formation.description}</p>

              <button
                onClick={() => handleVoirDetail(formation._id)}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition cursor-pointer"
                aria-label={`Voir les détails de la formation ${formation.title}`}
              >
                Voir la formation
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
