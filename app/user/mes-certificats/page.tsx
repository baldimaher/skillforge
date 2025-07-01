"use client";

import React, { useEffect, useState } from "react";

interface Certificate {
  _id: string;
  quizTitle: string;
  score: number;
  date: string;
  pdfUrl?: string;
}

export default function MesCertificatsPage() {
  const [certificats, setCertificats] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'utilisateur depuis localStorage
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setUserId(user._id);
      } catch (err) {
        console.error("Erreur parsing user dans localStorage", err);
      }
    } else {
      console.warn("Utilisateur non trouvé dans localStorage");
      setLoading(false); // On arrête le chargement si pas d'utilisateur
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function fetchCertificats() {
      try {
        const res = await fetch(`/api/user/mesCertificats/${userId}`);

        if (res.status === 404) {
          setCertificats([]);
        } else if (res.ok) {
          const data = await res.json();
          setCertificats(data);
        } else {
          console.error("Erreur inattendue lors du fetch");
        }
      } catch (error) {
        console.error("Erreur fetch certificats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificats();
  }, [userId]);

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <h1>Mes certificats</h1>
      {certificats.length === 0 ? (
        <p>Aucun certificat trouvé.</p>
      ) : (
        <ul>
          {certificats.map((certif) => (
            <li key={certif._id}>
              <p>Quiz : {certif.quizTitle}</p>
              <p>Score : {certif.score}</p>
              <p>Date : {new Date(certif.date).toLocaleDateString()}</p>
              {certif.pdfUrl && (
                <a href={certif.pdfUrl} target="_blank" rel="noopener noreferrer">
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
