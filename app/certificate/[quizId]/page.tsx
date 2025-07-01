"use client";

import { useEffect, useRef, useState } from "react";

import html2pdf from "html2pdf.js";
import { useParams } from "next/navigation";

interface Certificate {
  quizTitle: string;
  score: number;
  date: string;
  pdfUrl?: string;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  _id: string;
  role: string;
}

export default function CertificatePage() {
  const { quizId } = useParams() as { quizId: string };
  const [cert, setCert] = useState<Certificate | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchCertificate = async () => {
      try {
        const res = await fetch(`/api/certificates/${quizId}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCert(data);
        } else {
          setCert(null);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du certificat :", error);
        setCert(null);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchCertificate();
    }
  }, [quizId]);

 // Supprime cet import statique en haut du fichier
// import html2pdf from "html2pdf.js";

const handleDownloadPDF = async () => {
  if (certificateRef.current && cert && user) {
    const html2pdf = (await import("html2pdf.js")).default; // import dynamique ici

    const options = {
      margin: 0.5,
      filename: `Certificat-SkillForge-${user.firstName}-${cert.quizTitle}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: false },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
      .set(options)
      .from(certificateRef.current)
      .save()
      .catch((err: unknown) => console.error("Erreur lors de la génération du PDF :", err));
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center text-2xl font-semibold text-indigo-700">Chargement du certificat...</div>
      </div>
    );
  }

  if (!cert || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center text-2xl font-semibold text-red-600">Certificat ou utilisateur non trouvé.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-12">
      <div
        ref={certificateRef}
        className="relative p-12 bg-white rounded-2xl shadow-2xl max-w-4xl w-full text-center border-2 border-indigo-200"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {/* Decorative Double Border */}
        <div className="absolute inset-0 border-4 border-double border-indigo-300 rounded-2xl pointer-events-none"></div>

        {/* Header with Logo and CSS-based Stamp */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-bold text-indigo-900 tracking-tight select-none">SkillForge</h1>
          <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 border-indigo-600 bg-indigo-50 text-indigo-700 text-xs font-semibold select-none">
            <span>OFFICIAL</span>
            <span>SKILLFORGE</span>
            <span>SEAL</span>
          </div>
        </div>

        {/* Main Content */}
        <h2 className="text-4xl font-semibold mb-10 text-gray-800 tracking-wide">Certificat de Réussite</h2>

        <p className="text-lg text-gray-600 mb-4">Ceci atteste que</p>
        <p className="text-3xl font-bold text-indigo-800 mb-6 select-text">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-lg text-gray-600 mb-4">a complété avec succès le quiz</p>
        <p className="text-2xl font-medium text-indigo-700 mb-6 tracking-wide select-text">{cert.quizTitle}</p>
        <p className="text-lg text-gray-600 mb-8">
          avec un score de <span className="font-semibold text-indigo-700">{cert.score}%</span>
        </p>
        <p className="text-md text-gray-500 italic select-text">
          Délivré le : {new Date(cert.date).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {cert.pdfUrl && (
          <a
            href={cert.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 underline mt-6 block font-medium text-sm select-text"
          >
            Voir le certificat PDF original
          </a>
        )}

        {/* Footer with Signature and CSS-based Stamp */}
        <div className="mt-12 flex justify-between items-center px-10">
          <div className="text-left">
            <p className="border-t-2 border-gray-400 w-48 pt-2 text-gray-700 font-semibold select-text">
              Signature
            </p>
            <p className="text-gray-500 italic text-sm select-text">Directeur Général, SkillForge</p>
          </div>
          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-indigo-600 bg-indigo-50 text-indigo-700 text-xs font-semibold select-none">
            <span>OFFICIAL</span>
            <span>SKILLFORGE</span>
            <span>SEAL</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-8 flex gap-6">
        <button
          onClick={() => window.print()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg shadow-md transition duration-300 ease-in-out text-lg font-medium"
          aria-label="Imprimer le certificat"
        >
          Imprimer
        </button>
        <button
          onClick={handleDownloadPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg shadow-md transition duration-300 ease-in-out text-lg font-medium"
          aria-label="Télécharger le certificat en PDF"
        >
          Télécharger PDF
        </button>
      </div>
    </div>
  );
}