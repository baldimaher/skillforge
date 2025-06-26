"use client";

import { useState } from "react";

export default function AddProjectPage() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const projectData: any = {
        title,
        description,
        difficulty,
        duration,
        technologies: [],
        objectives: [],
        prerequisites: [],
        resources: [],
        githubUrl: link.trim(),
        userId: "685aae1749f778ebfe83ce3a",
      };

      if (link) projectData.githubUrl = link;

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Projet ajouté !");
        setTitle("");
        setLink("");
        setDescription("");
        setDuration("");
        setErrorMsg("");
      } else {
        if (data.errors) {
          setErrorMsg(data.errors.map((err: any) => err.message).join(" | "));
        } else {
          setErrorMsg(data.message || "Erreur lors de l'ajout.");
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Ajouter un Projet</h1>
      {errorMsg && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2">
          {errorMsg}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Titre du projet"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="url"
          placeholder="Lien du projet (GitHub, site...)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          placeholder="Description du projet"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="Beginner">Débutant</option>
          <option value="Intermediate">Intermédiaire</option>
          <option value="Advanced">Avancé</option>
        </select>
        <input
          type="text"
          placeholder="Durée estimée (ex: 2 semaines)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}
