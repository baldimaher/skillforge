"use client";

import { useState } from "react";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "doing" | "done";
  projectId: string;
}

interface CreateTaskFormProps {
  projectId: string;
  onCreate: (newTask: Task) => void;
}

export default function CreateTaskForm({ projectId, onCreate }: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "doing" | "done">("todo");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, projectId, status }),
      });

      const newTask = await res.json();
      onCreate(newTask); // appel de la fonction du parent
      setTitle("");
      setDescription("");
      setStatus("todo");
    } catch (err) {
      console.error("Erreur création tâche", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold">Créer une tâche</h2>
      <div>
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "todo" | "doing" | "done")}
          className="w-full border rounded px-3 py-2"
        >
          <option value="todo">À faire</option>
          <option value="doing">En cours</option>
          <option value="done">Terminé</option>
        </select>
      </div>
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
        Ajouter
      </button>
    </form>
  );
}
