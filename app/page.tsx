"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        localStorage.setItem("user", JSON.stringify(fullUser));
        localStorage.setItem("userId", fullUser._id);
        localStorage.setItem("email", fullUser.email);
        localStorage.setItem("lastName", fullUser.lastName);
        localStorage.setItem("userName", fullUser.firstName);
        localStorage.setItem("userRole", fullUser.role);

        router.push("/dashboard");
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
          <img
            src="/login.jpg"
            className="w-full max-w-md"
            alt="Illustration de connexion"
          />
        </div>

        {/* Formulaire */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-14 space-y-6">
          <h2 className="text-3xl font-bold text-indigo-700 text-center">Bonjour, bienvenue à nouveau</h2>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Nom d'utilisateur ou email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-indigo-500" />
                Se souvenir de moi
              </label>
              <a href="#" className="hover:underline text-indigo-600">Mot de passe oublié ?</a>
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
            <a href="/signup" className="text-indigo-600 hover:underline font-medium">Cliquez ici</a>
          </p>

       
        </div>
      </div>
    </div>
  );
}
