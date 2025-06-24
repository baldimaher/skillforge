"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddFormationPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
      setPhoto(null);
      setVideo(null);
      router.push("/admin/addformation"); // ou une autre page de redirection

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
