"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // Initialiser email, password, rememberMe en lisant dans localStorage au chargement
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("savedEmail");
      const savedPassword = localStorage.getItem("savedPassword");
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const fullUser = data.user;

        // Stocker les infos utilisateur (comme avant)
      const storage = localStorage;

        storage.setItem("user", JSON.stringify(fullUser));
        storage.setItem("userId", fullUser._id);
        storage.setItem("email", fullUser.email);
        storage.setItem("lastName", fullUser.lastName);
        storage.setItem("userName", fullUser.firstName);
        storage.setItem("userRole", fullUser.role);
        storage.setItem("ProjecTaken", JSON.stringify(fullUser.projectsTaken || []));
        storage.setItem("quizzes", JSON.stringify(fullUser.quizzes || []));
        storage.setItem("certificates", JSON.stringify(fullUser.certificates || []));

        // Sauvegarder ou supprimer email et password dans localStorage selon rememberMe
        if (rememberMe) {
          localStorage.setItem("savedEmail", email);
          localStorage.setItem("savedPassword", password);
        } else {
          localStorage.removeItem("savedEmail");
          localStorage.removeItem("savedPassword");
        }

        // Redirection selon rôle
        const userRole = fullUser.role;
        if (userRole === "admin") {
          router.push("/admin/progress");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Erreur lors de la connexion");
      }
    } catch (err) {
      setError("Erreur serveur. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-white px-4">
      <div className="flex w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden">
        {/* Illustration */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center p-10">
          <img src="/login.jpg" className="w-full max-w-md" alt="Illustration de connexion" />
        </div>

        {/* Formulaire */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-14 space-y-6">
          <h2 className="text-3xl font-bold text-indigo-700 text-center">
            Bonjour, bienvenue à nouveau
          </h2>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block mb-2 text-gray-700 font-medium">
                Nom d'utilisateur ou email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Entrez votre email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-gray-700 font-medium">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                placeholder="Entrez votre mot de passe"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">

              <Link href="/forgot-password" className="hover:underline text-indigo-600">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 transition"
              }`}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Vous n'avez pas de compte ?{" "}
            <Link href="/signup" className="text-indigo-600 hover:underline font-medium">
              Cliquez ici
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
