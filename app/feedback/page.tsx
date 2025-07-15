"use client";

import { useEffect, useState } from "react";

import axios from "axios";

interface Feedback {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  comment: string;
  rating: number;
  createdAt: string;
}

type RoleType = "user" | "admin";

interface Alert {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function FeedbackPage() {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [role, setRole] = useState<RoleType>("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const maxCommentLength = 500;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?._id) setUserId(user._id);
    if (user?.role) setRole(user.role);
  }, []);

  const addAlert = (type: "success" | "error", message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 3000);
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/feedback");
      setFeedbacks(res.data);
    } catch (err) {
      setError("Erreur lors du chargement des avis.");
      addAlert("error", "Erreur lors du chargement des avis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return addAlert("error", "Le commentaire est requis.");
    setLoading(true);
    try {
      await axios.post("/api/feedback", { userId, comment, rating });
      setComment("");
      setRating(5);
      fetchFeedbacks();
      addAlert("success", "Avis envoyé avec succès !");
    } catch {
      addAlert("error", "Erreur lors de l'envoi de votre avis.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setComment(feedback.comment);
    setRating(feedback.rating);
  };

const handleUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingFeedback || !comment.trim()) return addAlert("error", "Le commentaire est requis.");
  setLoading(true);
  try {
    await axios.put(`/api/feedback?id=${editingFeedback._id}`, { comment, rating });
    setEditingFeedback(null);
    setComment("");
    setRating(5);
    fetchFeedbacks();
    addAlert("success", "Avis mis à jour avec succès !");
  } catch {
    addAlert("error", "Erreur lors de la mise à jour de l'avis.");
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet avis ?")) return;
    setLoading(true);
    try {
      await axios.delete(`/api/feedback?id=${id}`);
      fetchFeedbacks();
      addAlert("success", "Avis supprimé avec succès !");
    } catch {
      addAlert("error", "Erreur lors de la suppression de l'avis.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, editable = false) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-2xl ${
            editable ? "cursor-pointer hover:scale-110 transition-transform" : ""
          } ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
          onClick={editable ? () => setRating(star) : undefined}
          role={editable ? "button" : undefined}
          aria-label={editable ? `Noter ${star} étoile${star > 1 ? "s" : ""}` : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-teal-900 mb-10 tracking-tight">
          {role === "user" ? "Partagez votre expérience" : "Avis des utilisateurs"}
        </h1>

        <div className="fixed top-4 right-4 z-50 space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg shadow-md text-white animate-slide-in ${
                alert.type === "success" ? "bg-teal-600" : "bg-red-600"
              }`}
            >
              {alert.message}
            </div>
          ))}
        </div>

        {role === "user" && (
          <form
            onSubmit={handleSubmit}
            className="mb-12 bg-white p-8 rounded-2xl shadow-xl border border-teal-100"
          >
            <div className="space-y-6">
              <div>
                <label htmlFor="comment" className="block text-lg font-semibold text-teal-900">
                  Votre commentaire
                </label>
                <textarea
                  id="comment"
                  className="mt-2 w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none shadow-sm transition"
                  placeholder="Dites-nous ce que vous pensez..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, maxCommentLength))}
                  rows={5}
                  required
                />
                <p className={`text-sm mt-1 ${comment.length > maxCommentLength * 0.9 ? "text-red-600" : "text-gray-500"}`}>
                  {comment.length}/{maxCommentLength} caractères
                </p>
              </div>

              <div>
                <label className="block text-lg font-semibold text-teal-900">Note</label>
                <div className="mt-2">{renderStars(rating, true)}</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? "Envoi en cours..." : "Envoyer"}
              </button>
            </div>
          </form>
        )}

        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600"></div>
            <p className="text-teal-900 mt-2 font-medium">Chargement des avis...</p>
          </div>
        )}
        {error && <p className="text-center text-red-600 font-medium bg-red-50 p-4 rounded-lg">{error}</p>}

        <div className="space-y-6">
          {feedbacks.length === 0 && !loading && (
            <p className="text-center text-teal-900 text-lg font-medium bg-white p-6 rounded-lg shadow">
              Aucun avis disponible pour le moment.
            </p>
          )}

          {feedbacks.map((fb) => (
            <article
              key={fb._id}
              className={`bg-white rounded-2xl shadow-md p-6 border-l-4 ${
                fb.userId?._id === userId ? "border-teal-500" : "border-gray-200"
              } hover:shadow-xl transition-transform transform hover:scale-[1.01]`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <div className="flex items-center space-x-3">
                    <p className="font-semibold text-teal-900 text-lg">
                      {fb.userId?.firstName} {fb.userId?.lastName}
                    </p>
                    <div>{renderStars(fb.rating)}</div>
                  </div>
                  <p className="mt-2 text-gray-700 leading-relaxed">{fb.comment}</p>
                  <time className="text-gray-500 text-sm mt-2 block">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <div className="flex space-x-4 mt-4 sm:mt-0">
                  {(role === "admin" || fb.userId?._id === userId) && (
                    <button
                      onClick={() => handleEdit(fb)}
                      className="text-teal-600 hover:text-teal-800 font-medium transition-colors"
                    >
                      Modifier
                    </button>
                  )}
                  {role === "admin" && (
                    <button
                      onClick={() => handleDelete(fb._id)}
                      className="text-red-600 hover:text-red-800 font-medium transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {editingFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl transform transition-transform duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-teal-900">Modifier l'avis</h2>
              <button
                onClick={() => {
                  setEditingFeedback(null);
                  setComment("");
                  setRating(5);
                }}
                className="text-gray-600 hover:text-gray-800 font-semibold text-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label htmlFor="edit-comment" className="block text-lg font-semibold text-teal-900">
                  Commentaire
                </label>
                <textarea
                  id="edit-comment"
                  className="mt-2 w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none shadow-sm transition"
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, maxCommentLength))}
                  rows={5}
                  required
                />
                <p className={`text-sm mt-1 ${comment.length > maxCommentLength * 0.9 ? "text-red-600" : "text-gray-500"}`}>
                  {comment.length}/{maxCommentLength} caractères
                </p>
              </div>
              <div>
                <label className="block text-lg font-semibold text-teal-900">Note</label>
                <div className="mt-2">{renderStars(rating, true)}</div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {loading ? "Mise à jour..." : "Mettre à jour"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingFeedback(null);
                    setComment("");
                    setRating(5);
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-transform transform hover:scale-105"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}