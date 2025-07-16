"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError("Token manquant ou invalide dans l'URL.");
    }
  }, [token]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Le mot de passe doit contenir au moins 6 caractères.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Mot de passe réinitialisé avec succès.");
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Erreur inattendue.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
      console.error("Erreur réseau:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-white px-4">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center space-y-4">
          <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
          <a href="/forgot-password" className="text-indigo-600 hover:underline font-medium">
            Demander un nouveau lien
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-white px-4">
      <div className="flex w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Illustration */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center p-10">
          <img
            src="/reset.jpg"
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
            <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-center shadow-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg text-center shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm disabled:opacity-50 transition"
            />

            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm disabled:opacity-50 transition"
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
              {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Vous avez déjà un compte ?{" "}
            <a href="/" className="text-indigo-600 hover:underline font-medium">
              Connectez-vous ici
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
