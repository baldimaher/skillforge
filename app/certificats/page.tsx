"use client";

import { useEffect, useState } from "react";

interface Certificate {
  _id: string;
  quizTitle: string;
  score: number;
  date: string;
}

export default function CertificatsPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (user && user._id) {
      fetch(`/api/certificates/${user._id}`)
        .then((res) => res.json())
        .then((data) => setCerts(data))
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) return <p className="p-4 text-center">Chargement...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Mes certificats</h1>
      {certs.length === 0 ? (
        <p>Aucun certificat obtenu pour le moment.</p>
      ) : (
        <ul className="space-y-4">
          {certs.map((cert) => (
            <li key={cert._id} className="bg-white shadow-md p-4 rounded-lg">
              <h2 className="text-xl font-semibold">{cert.quizTitle}</h2>
              <p>Score : {cert.score}%</p>
              <p>Date : {new Date(cert.date).toLocaleDateString("fr-FR")}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
