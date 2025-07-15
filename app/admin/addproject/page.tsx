"use client";

import { useEffect, useState } from "react";

export default function AddProjectPage() {
export default function AddProjectPage() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [link, setLink] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [objectives, setObjectives] = useState("");
  const [status, setStatus] = useState("à venir");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const userStr =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const [objectives, setObjectives] = useState("");
  const [status, setStatus] = useState("à venir");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const userStr =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userStr ? JSON.parse(userStr) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const techArray = technologies
      .split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech.length > 0);

    const objArray = objectives
      .split(";")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          technologies: techArray,
          objectives: objArray,
          status,
          difficulty,
          duration,
          githubUrl: link.trim(),
          demoUrl: demoUrl.trim(),
          userId: user?._id,
        }),
      });

      const data = await res.json();
    const techArray = technologies
      .split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech.length > 0);

    const objArray = objectives
      .split(";")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          technologies: techArray,
          objectives: objArray,
          status,
          difficulty,
          duration,
          githubUrl: link.trim(),
          demoUrl: demoUrl.trim(),
          userId: user?._id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Projet ajouté avec succès !");
        setTitle("");
        setLink("");
        setDemoUrl("");
        setDescription("");
        setDuration("");
        setTechnologies("");
        setObjectives("");
        setStatus("à venir");
        setDifficulty("Beginner");
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Erreur lors de l'ajout.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setErrorMsg("Erreur réseau ou serveur.");
      if (res.ok) {
        setSuccessMsg("Projet ajouté avec succès !");
        setTitle("");
        setLink("");
        setDemoUrl("");
        setDescription("");
        setDuration("");
        setTechnologies("");
        setObjectives("");
        setStatus("à venir");
        setDifficulty("Beginner");
        setErrorMsg("");
      } else {
        setErrorMsg(data.message || "Erreur lors de l'ajout.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setErrorMsg("Erreur réseau ou serveur.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Ajouter un Projet</h1>
      {errorMsg && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2">
          {errorMsg}
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Ajouter un Projet</h1>
      {errorMsg && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-100 text-green-700 px-3 py-2 rounded mb-2">
          {successMsg}
      )}
      {successMsg && (
        <div className="bg-green-100 text-green-700 px-3 py-2 rounded mb-2">
          {successMsg}
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
          placeholder="Lien GitHub"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="url"
          placeholder="Lien de démo"
          value={demoUrl}
          onChange={(e) => setDemoUrl(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          placeholder="Description du projet"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <textarea
          placeholder="Objectifs (séparés par ;) ex: Apprendre React;Maîtriser les hooks"
          value={objectives}
          onChange={(e) => setObjectives(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Technologies (ex: React, Node.js)"
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          className="w-full border px-3 py-2 rounded"
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
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="à venir">À venir</option>
          <option value="en cours">En cours</option>
          <option value="terminé">Terminé</option>
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
          placeholder="Lien GitHub"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="url"
          placeholder="Lien de démo"
          value={demoUrl}
          onChange={(e) => setDemoUrl(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          placeholder="Description du projet"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <textarea
          placeholder="Objectifs (séparés par ;) ex: Apprendre React;Maîtriser les hooks"
          value={objectives}
          onChange={(e) => setObjectives(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Technologies (ex: React, Node.js)"
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          className="w-full border px-3 py-2 rounded"
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
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="à venir">À venir</option>
          <option value="en cours">En cours</option>
          <option value="terminé">Terminé</option>
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