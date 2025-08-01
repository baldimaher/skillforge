"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddFormationPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [instructor, setInstructor] = useState("");
  const [level, setLevel] = useState("");       // ajouté
  const [category, setCategory] = useState(""); // ajouté
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("duration", duration);
    formData.append("instructor", instructor);
    formData.append("level", level);         // ajouté
    formData.append("category", category);   // ajouté
    if (photo) formData.append("photo", photo);
    if (video) formData.append("video", video);

    try {
      const res = await fetch("/api/Formation", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'ajout de la formation");
      }

      setSuccess("Formation ajoutée avec succès !");
      setTitle("");
      setDescription("");
      setDuration("");
      setInstructor("");
      setLevel("");        // reset
      setCategory("");     // reset
      setPhoto(null);
      setVideo(null);

      router.push("/admin/addformation"); // ou autre page

    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Ajouter une Formation</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Titre"
          className="w-full p-3 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          className="w-full p-3 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Durée (ex: 2h30)"
          className="w-full p-3 border rounded"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Nom du formateur"
          className="w-full p-3 border rounded"
          value={instructor}
          onChange={(e) => setInstructor(e.target.value)}
          required
        />

        {/* Nouveau champ Niveau */}
        <input
          type="text"
          placeholder="Niveau (ex: Débutant, Intermédiaire)"
          className="w-full p-3 border rounded"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        />

        {/* Nouveau champ Catégorie */}
        <input
          type="text"
          placeholder="Catégorie (ex: Programmation, Design)"
          className="w-full p-3 border rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="w-full"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
        />

        <input
          type="file"
          accept="video/*"
          className="w-full"
          onChange={(e) => setVideo(e.target.files?.[0] || null)}
        />

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}
