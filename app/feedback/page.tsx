"use client";

import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
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

  // Detect system theme (light or dark mode)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?._id) setUserId(user._id);
    if (user?.role) setRole(user.role);

    // Detect system theme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mediaQuery.matches ? "dark" : "light");
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
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
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${
      theme === "light" ? "bg-gradient-to-b from-blue-100 to-gray-100" : "bg-gradient-to-b from-purple-900 to-gray-900"
    }`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-4xl font-extrabold text-center mb-10 tracking-tight ${
          theme === "light" ? "text-blue-900" : "text-purple-200"
        }`}>
          {role === "user" ? "Partagez votre expérience" : "Avis des utilisateurs"}
        </h1>

        <div className="fixed top-4 right-4 z-50 space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg shadow-md text-white animate-slide-in ${
                alert.type === "success"
                  ? theme === "light" ? "bg-blue-500" : "bg-purple-500"
                  : "bg-red-600"
              }`}
            >
              {alert.message}
            </div>
          ))}
        </div>

        {role === "user" && (
          <form
            onSubmit={editingFeedback ? handleUpdate : handleSubmit}
            className={`mb-12 p-8 rounded-2xl shadow-xl border ${
              theme === "light" ? "bg-white border-blue-100" : "bg-gray-800 border-purple-700"
            }`}
          >
            <div className="space-y-6">
              <div>
                <label htmlFor="comment" className={`block text-lg font-semibold ${
                  theme === "light" ? "text-blue-900" : "text-purple-200"
                }`}>
                  Votre commentaire
                </label>
                <textarea
                  id="comment"
                  className={`mt-2 w-full border rounded-lg p-4 focus:ring-2 resize-none shadow-sm transition ${
                    theme === "light"
                      ? "border-gray-200 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-900"
                      : "border-gray-600 focus:ring-purple-400 focus:border-purple-400 bg-gray-700 text-gray-100"
                  }`}
                  placeholder="Dites-nous ce que vous pensez..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, maxCommentLength))}
                  rows={5}
                  required
                />
                <p className={`text-sm mt-1 ${
                  comment.length > maxCommentLength * 0.9 ? "text-red-600" : theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}>
                  {comment.length}/{maxCommentLength} caractères
                </p>
              </div>

              <div>
                <label className={`block text-lg font-semibold ${
                  theme === "light" ? "text-blue-900" : "text-purple-200"
                }`}>
                  Note
                </label>
                <div className="mt-2">{renderStars(rating, true)}</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full font-semibold py-3 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${
                  theme === "light"
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
              >
                {loading ? (editingFeedback ? "Mise à jour..." : "Envoi en cours...") : (editingFeedback ? "Mettre à jour" : "Envoyer")}
              </button>
            </div>
          </form>
        )}

        {loading && (
          <div className="text-center">
            <div className={`inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${
              theme === "light" ? "border-blue-500" : "border-purple-500"
            }`}></div>
            <p className={`mt-2 font-medium ${
              theme === "light" ? "text-blue-900" : "text-purple-200"
            }`}>Chargement des avis...</p>
          </div>
        )}
        {error && (
          <p className={`text-center text-red-600 font-medium p-4 rounded-lg ${
            theme === "light" ? "bg-red-50" : "bg-red-900/50"
          }`}>{error}</p>
        )}

        <div className="space-y-6">
          {feedbacks.length === 0 && !loading && (
            <p className={`text-center text-lg font-medium p-6 rounded-lg shadow ${
              theme === "light" ? "text-blue-900 bg-white" : "text-purple-200 bg-gray-800"
            }`}>
              Aucun avis disponible pour le moment.
            </p>
          )}

          {feedbacks.map((fb) => (
            <article
              key={fb._id}
              className={`rounded-2xl shadow-md p-6 border-l-4 hover:shadow-xl transition-transform transform hover:scale-[1.01] ${
                theme === "light"
                  ? fb.userId?._id === userId ? "bg-white border-blue-400" : "bg-white border-gray-200"
                  : fb.userId?._id === userId ? "bg-gray-800 border-purple-400" : "bg-gray-800 border-gray-600"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <div className="flex items-center space-x-3">
                    <p className={`font-semibold text-lg ${
                      theme === "light" ? "text-blue-900" : "text-purple-200"
                    }`}>
                      {fb.userId?.firstName} {fb.userId?.lastName}
                    </p>
                    <div>{renderStars(fb.rating)}</div>
                  </div>
                  <p className={`mt-2 leading-relaxed ${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}>{fb.comment}</p>
                  <time className={`text-sm mt-2 block ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}>
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <div className="flex space-x-4 mt-4 sm:mt-0">
                  {(role === "admin" || fb.userId?._id === userId) && (
                    <button
                      onClick={() => handleEdit(fb)}
                      className={`w-6 h-6 ${
                        theme === "light" ? "text-blue-500 hover:text-blue-700" : "text-purple-400 hover:text-purple-600"
                      }`}
                      title="Modifier"
                    >
                      <PencilIcon />
                    </button>
                  )}
                  {role === "admin" && (
                    <button
                      onClick={() => handleDelete(fb._id)}
                      className="w-6 h-6 text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {editingFeedback && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
          theme === "light" ? "bg-black/60" : "bg-black/80"
        }`}>
          <div className={`rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl transform transition-transform duration-300 scale-100 ${
            theme === "light" ? "bg-white" : "bg-gray-800"
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${
                theme === "light" ? "text-blue-900" : "text-purple-200"
              }`}>Modifier l'avis</h2>
              <button
                onClick={() => {
                  setEditingFeedback(null);
                  setComment("");
                  setRating(5);
                }}
                className={`font-semibold text-lg ${
                  theme === "light" ? "text-gray-600 hover:text-gray-800" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label htmlFor="edit-comment" className={`block text-lg font-semibold ${
                  theme === "light" ? "text-blue-900" : "text-purple-200"
                }`}>
                  Commentaire
                </label>
                <textarea
                  id="edit-comment"
                  className={`mt-2 w-full border rounded-lg p-4 focus:ring-2 resize-none shadow-sm transition ${
                    theme === "light"
                      ? "border-gray-200 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-900"
                      : "border-gray-600 focus:ring-purple-400 focus:border-purple-400 bg-gray-700 text-gray-100"
                  }`}
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, maxCommentLength))}
                  rows={5}
                  required
                />
                <p className={`text-sm mt-1 ${
                  comment.length > maxCommentLength * 0.9 ? "text-red-600" : theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}>
                  {comment.length}/{maxCommentLength} caractères
                </p>
              </div>
              <div>
                <label className={`block text-lg font-semibold ${
                  theme === "light" ? "text-blue-900" : "text-purple-200"
                }`}>
                  Note
                </label>
                <div className="mt-2">{renderStars(rating, true)}</div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-semibold py-3 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${
                    theme === "light"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-purple-500 hover:bg-purple-600 text-white"
                  }`}
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
                  className={`w-full font-semibold py-3 rounded-lg transition-transform transform hover:scale-105 ${
                    theme === "light"
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      : "bg-gray-600 hover:bg-gray-500 text-gray-100"
                  }`}
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
