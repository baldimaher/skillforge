"use client";

import Certificate, { openCertificateInNewTab } from "@/app/certificate/[quizId]/page";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface Certificate {
  _id: string;
  quizTitle: string;
  score: number;
  date: string;
  pdfUrl?: string;
}

interface UserType {
  _id: string;
  firstName: string;
  lastName: string;
}

export default function MesCertificatsPage() {
  const [certificats, setCertificats] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [_id, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [showCertificate, setShowCertificate] = useState<string | null>(null); // ID du certificat à afficher
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'utilisateur depuis localStorage
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        console.log("Utilisateur chargé depuis localStorage :", userData);
        setUser(userData);
        setUserId(userData._id);
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

  // Fonction pour valider si l'URL est correcte
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle certificate display (même méthode que QuizzesPage)
  const handleShowCertificate = (certif: Certificate) => {
    if (!user) {
      setMessage("Erreur : Données utilisateur manquantes.");
      return;
    }
    setShowCertificate(certif._id);
    setMessage(null);
  };

  // Handle certificate download in new tab (même méthode que QuizzesPage)
  const handleOpenCertificateInNewTab = (certif: Certificate) => {
    if (!user) {
      setMessage("Erreur : Données utilisateur manquantes.");
      return;
    }
    openCertificateInNewTab(user, certif.quizTitle, certif.score);
    setMessage(null);
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mes certificats</h1>

      {message && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-6">
          {message}
        </div>
      )}

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
              <p>Score : {certif.score}%</p>
              <p>Date : {new Date(certif.date).toLocaleDateString()}</p>
              
              {/* Boutons d'action pour le certificat */}
              <div className="mt-4 flex flex-wrap gap-4">
                {/* Bouton pour afficher le certificat (même méthode que QuizzesPage) */}
                <Button
                  onClick={() => handleShowCertificate(certif)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
                >
                  Afficher certificat
                </Button>

                {/* Bouton pour ouvrir le certificat dans un nouvel onglet */}
                <Button
                  onClick={() => handleOpenCertificateInNewTab(certif)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
                >
                  Voir certificat
                </Button>

                {/* Liens existants pour le PDF si disponible */}
                {certif.pdfUrl && isValidUrl(certif.pdfUrl) && (
                  <>
                    <a
                      href={certif.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                      onError={() => alert("Erreur lors du chargement du certificat.")}
                    >
                      Voir le PDF
                    </a>
                    <a
                      href={certif.pdfUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 underline hover:text-green-800"
                      onError={() => alert("Erreur lors du téléchargement du certificat.")}
                    >
                      Télécharger le PDF
                    </a>
                  </>
                )}
              </div>

              {/* Affichage du certificat si sélectionné */}
              {showCertificate === certif._id && user && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Certificat</h3>
                    <Button
                      onClick={() => setShowCertificate(null)}
                      variant="outline"
                      size="sm"
                    >
                      Fermer
                    </Button>
                  </div>
                  <Certificate
                    user={user}
                    quizTitle={certif.quizTitle}
                    score={certif.score}
                  />
                </div>
              )}

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}