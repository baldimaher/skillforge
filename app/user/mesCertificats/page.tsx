"use client";

import Certificate, { openCertificateInNewTab } from "@/app/certificate/[quizId]/page";
import { Download, Eye, FileText, Loader2, X } from "lucide-react";
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
  const [showCertificate, setShowCertificate] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        setUser(userData);
        setUserId(userData._id);
      } catch (err) {
        console.error("Erreur parsing user dans localStorage", err);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!_id) return;

    async function fetchCertificats() {
      try {
        const res = await fetch(`/api/user/mesCertificat/${_id}`);
        if (res.status === 404) {
          setCertificats([]);
        } else if (res.ok) {
          const data = await res.json();
          setCertificats(data);
        } else {
          console.error("Erreur serveur :", res.status);
        }
      } catch (error) {
        console.error("Erreur fetch certificats :", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificats();
  }, [_id]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleShowCertificate = (certif: Certificate) => {
    if (!user) {
      setMessage("Erreur : Données utilisateur manquantes.");
      return;
    }
    setShowCertificate(certif._id);
    setMessage(null);
  };

  const handleOpenCertificateInNewTab = (certif: Certificate) => {
    if (!user) {
      setMessage("Erreur : Données utilisateur manquantes.");
      return;
    }
    openCertificateInNewTab(user, certif.quizTitle, certif.score);
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-60">
        <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FileText className="w-7 h-7 text-blue-600" />
        Mes certificats
      </h1>

      {message && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded mb-6">
          {message}
        </div>
      )}

      {certificats.length === 0 ? (
        <p className="text-center text-gray-500">Aucun certificat trouvé.</p>
      ) : (
        <ul className="space-y-6">
          {certificats.map((certif) => (
            <li
              key={certif._id}
              className="bg-white shadow rounded-lg p-5 hover:shadow-lg transition duration-300"
            >
              <div className="mb-3">
                <p className="text-lg font-semibold text-gray-800">
                  Quiz : {certif.quizTitle}
                </p>
                <p className="text-sm text-gray-600">Score : {certif.score}%</p>
                <p className="text-sm text-gray-500">
                  Date : {new Date(certif.date).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleShowCertificate(certif)}
                >
                  <Eye className="mr-2 w-4 h-4" />
                  Afficher
                </Button>

                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => handleOpenCertificateInNewTab(certif)}
                >
                  <Eye className="mr-2 w-4 h-4" />
                  Voir dans un onglet
                </Button>

                {certif.pdfUrl && isValidUrl(certif.pdfUrl) && (
                  <>
                    <a
                      href={certif.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 text-sm flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir le PDF
                    </a>
                    <a
                      href={certif.pdfUrl}
                      download
                      className="text-green-600 underline hover:text-green-800 text-sm flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger PDF
                    </a>
                  </>
                )}
              </div>

              {showCertificate === certif._id && user && (
                <div className="mt-6 bg-gray-50 border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg">Aperçu du Certificat</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCertificate(null)}
                    >
                      <X className="w-4 h-4 mr-1" />
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
