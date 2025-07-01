"use client";

import { useEffect, useState } from "react";

import axios from "axios";

interface Feedback {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  comment: string;
  rating: number;
  createdAt: string;
}

type RoleType = "user" | "admin";

export default function FeedbackPage() {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [role, setRole] = useState<RoleType>("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?._id) setUserId(user._id);
    if (user?.role) setRole(user.role);
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/feedback");
      setFeedbacks(res.data);
    } catch (err) {
      setError("Erreur lors du chargement des avis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await axios.post("/api/feedback", {
        userId,
        comment,
        rating,
      });
      setComment("");
      setRating(5);
      fetchFeedbacks();
    } catch {
      alert("Erreur lors de l'envoi de votre avis.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet avis ?")) return;

    try {
      await axios.delete(`/api/feedback?id=${id}`);
      fetchFeedbacks();
    } catch {
      alert("Erreur lors de la suppression de l'avis.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        {role === "user" ? "Laissez votre avis" : "Tous les avis des utilisateurs"}
      </h1>

      {role === "user" && (
        <form onSubmit={handleSubmit} className="mb-10 space-y-4 bg-white p-6 rounded-lg shadow-md">
          <label htmlFor="comment" className="block font-semibold mb-1">
            Votre commentaire
          </label>
          <textarea
            id="comment"
            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Exprimez-vous..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            required
          />

          <label htmlFor="rating" className="block font-semibold mb-1">
            Note
          </label>
          <select
            id="rating"
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "étoile" : "étoiles"}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded w-full"
          >
            Envoyer
          </button>
        </form>
      )}

      {loading && <p className="text-center text-gray-500">Chargement des avis...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      <div className="space-y-6">
        {feedbacks.length === 0 && !loading && (
          <p className="text-center text-gray-600">Aucun avis disponible pour le moment.</p>
        )}

        {feedbacks.map((fb) => (
          <article
            key={fb._id}
            className="bg-white rounded-lg shadow p-5 border border-gray-200 flex flex-col sm:flex-row justify-between"
          >
            <div>
              <p className="font-semibold text-gray-900">
                {fb.userId?.firstName} {fb.userId?.lastName}{" "}
                <span className="text-yellow-500 font-bold">({fb.rating}⭐)</span>
              </p>
              <p className="mt-2 text-gray-700">{fb.comment}</p>
              <time
                className="text-gray-400 text-sm mt-1 block"
                dateTime={fb.createdAt}
              >
                {new Date(fb.createdAt).toLocaleDateString()}
              </time>
            </div>
            {role === "admin" && (
              <button
                onClick={() => handleDelete(fb._id)}
                className="self-start text-red-600 hover:text-red-800 mt-4 sm:mt-0 sm:ml-6"
                aria-label={`Supprimer l'avis de ${fb.userId?.firstName} ${fb.userId?.lastName}`}
              >
                Supprimer
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
