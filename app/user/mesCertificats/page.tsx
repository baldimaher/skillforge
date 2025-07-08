"use client";

import React, { useEffect, useState } from "react";

interface Certificate {
  _id: string;
  quizTitle: string; // Correspond à ton modèle backend
  score: number;
  date: string;
  pdfUrl?: string;
}

export default function MesCertificatsPage() {
  const [certificats, setCertificats] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [_id, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'utilisateur depuis localStorage
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        console.log("Utilisateur chargé depuis localStorage :", user);
        setUserId(user._id);
      } catch (err) {
        console.error("Erreur parsing user dans localStorage", err);
        setLoading(false);
      }
    } else {
      console.warn("Utilisateur non trouvé dans localStorage");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!_id) return;

    async function fetchCertificats() {
      console.log("Récupération certificats pour user ID :", _id);

      try {
        const res = await fetch(`/api/user/mesCertificat/${_id}`);

        if (res.status === 404) {
          console.warn("Aucun certificat trouvé pour cet utilisateur");
          setCertificats([]);
        } else if (res.ok) {
          const data = await res.json();
          console.log("Certificats reçus :", data);
          setCertificats(data);
        } else {
          console.error("Erreur lors du fetch des certificats :", res.status);
        }
      } catch (error) {
        console.error("Erreur fetch certificats :", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificats();
  }, [_id]);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mes certificats</h1>

      {certificats.length === 0 ? (
        <p>Aucun certificat trouvé.</p>
      ) : (
        <ul className="space-y-5">
          {certificats.map((certif) => (
            <li
              key={certif._id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <p className="font-semibold text-lg">Quiz : {certif.quizTitle}</p>
              <p>Score : {certif.score}</p>
              <p>Date : {new Date(certif.date).toLocaleDateString()}</p>
              {certif.pdfUrl && (
                <a
                  href={certif.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline mt-2 inline-block"
                >
                  Voir le certificat
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
