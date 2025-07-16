"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    if (!email) {
      setError("L'email est requis.");
      setIsLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Format d'email invalide.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Lien de réinitialisation envoyé !");
        setEmail("");
      } else {
        setError(data.error || "Erreur lors de l'envoi.");
      }
    } catch (err) {
      setError("Erreur serveur. Réessayez plus tard.");
      console.error("Erreur réseau :", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-white px-4">
      <div className="flex w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Illustration */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center p-10">
          <img
            src="/forget.jpg"
            alt="Réinitialisation"
            className="w-full max-w-sm rounded-xl shadow-md"
          />
        </div>

        {/* Formulaire */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-14 space-y-6">
          <h2 className="text-3xl font-extrabold text-indigo-700 text-center">
            Réinitialiser le mot de passe
          </h2>

          {message && (
            <div className="bg-green-50 border border-green-300 text-green-800 text-sm px-4 py-3 rounded-lg text-center shadow-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 text-sm px-4 py-3 rounded-lg text-center shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              name="email"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm disabled:opacity-50 transition"
              autoComplete="email"
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl text-white font-semibold text-base transition-all duration-300 ${
                isLoading
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
              }`}
            >
              {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Vous vous souvenez de votre mot de passe ?{" "}
            <a href="/" className="text-indigo-600 hover:underline font-medium">
              Connectez-vous ici
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
