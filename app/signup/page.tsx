"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        router.push("/"); // redirection vers login
      } else {
        setError(data.error || "Erreur lors de la création du compte");
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
            alt="Illustration d'inscription"
            className="w-full max-w-md"
          />
        </div>

        {/* Formulaire */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-14 space-y-6">
          <h2 className="text-3xl font-bold text-indigo-700 text-center">Créer un compte</h2>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="firstName"
              type="text"
              placeholder="Prénom"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              disabled={loading}
              autoComplete="given-name"
            />

            <input
              name="lastName"
              type="text"
              placeholder="Nom"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              disabled={loading}
              autoComplete="family-name"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              disabled={loading}
              autoComplete="email"
            />

            <input
              name="phone"
              type="tel"
              placeholder="Téléphone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              disabled={loading}
              autoComplete="tel"
            />

            <input
              name="birthDate"
              type="date"
              placeholder="Date de naissance"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              disabled={loading}
            />

            <input
              name="password"
              type="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              disabled={loading}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 transition"
              }`}
            >
              {loading ? "Création..." : "Créer un compte"}
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
