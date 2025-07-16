"use client";

import { useState } from "react";

interface TaskStatusUpdaterProps {
  taskId: string;
  projectId: string;
  currentStatus: "todo" | "doing" | "done";
  onProjectCompleted?: () => void; // Callback appelé si le projet est terminé
}

export default function TaskStatusUpdater({
  taskId,
  projectId,
  currentStatus,
  onProjectCompleted,
}: TaskStatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleChangeStatus(newStatus: "todo" | "doing" | "done") {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Erreur lors de la mise à jour");
      } else {
        setStatus(newStatus);
        if (data.project?.status === "terminé") {
          setMessage("🎉 Félicitations ! Le projet est terminé !");
          if (onProjectCompleted) onProjectCompleted();
        } else {
          setMessage("Statut mis à jour avec succès.");
        }
      }
    } catch {
      setMessage("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <select
        value={status}
        onChange={(e) => handleChangeStatus(e.target.value as "todo" | "doing" | "done")}
        disabled={loading}
        className="border rounded px-3 py-1"
        aria-label="Changer le statut de la tâche"
      >
        <option value="todo">À faire</option>
        <option value="doing">En cours</option>
        <option value="done">Terminé</option>
      </select>
      {message && (
        <p className={`text-sm ${message.includes("Félicitations") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}