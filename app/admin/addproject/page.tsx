"use client";

import { useState } from "react";

export default function AddProjectPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState(""); // chaîne séparée par des virgules
  const [status, setStatus] = useState("à venir");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convertir la chaîne technologies en tableau (trim pour enlever espaces)
    const techArray = technologies
      .split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech.length > 0);

    try {
      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, technologies: techArray, status }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Projet ajouté !");
        setTitle("");
        setDescription("");
        setTechnologies("");
        setStatus("à venir");
      } else {
        alert(data.message || "Erreur lors de l'ajout.");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Ajouter un Projet</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Titre du projet"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <textarea
          placeholder="Description du projet"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Technologies (séparées par des virgules)"
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="à venir">À venir</option>
          <option value="en cours">En cours</option>
          <option value="terminé">Terminé</option>
        </select>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Ajouter
        </button>
      </form>
    </div>
  );
}
