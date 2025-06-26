"use client";

import { CheckCircle, ClipboardList, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import CreateTaskForm from "@/components/CreateTaskForm";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "doing" | "done";
  projectId: string;
}

export default function KanbanPage() {
  const params = useParams() as { id: string };
  const projectId = params.id;
console.log("params", params); // doit afficher : { id: "quelqueChose" }

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      const projectTasks = data.filter((task: Task) => task.projectId === projectId);
      setTasks(projectTasks);
    } catch (err) {
      console.error("Erreur récupération tâches", err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const columns = [
    {
      status: "todo",
      label: "À faire",
      icon: <ClipboardList className="w-5 h-5 text-blue-500" />,
    },
    {
      status: "doing",
      label: "En cours",
      icon: <Loader2 className="w-5 h-5 text-yellow-500 animate-spin-slow" />,
    },
    {
      status: "done",
      label: "Terminé",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-100 px-6 py-10">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 flex items-center gap-3">
        <FileText className="w-8 h-8 text-indigo-600" />
        Tableau Kanban
      </h1>

      {projectId && <CreateTaskForm projectId={projectId} onCreate={addTask} />}

      {loading ? (
        <p className="text-gray-600 mt-10">Chargement des tâches...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {columns.map((column) => (
            <div
              key={column.status}
              className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-4 border-b pb-2">
                {column.icon}
                <h2 className="text-lg font-semibold text-gray-700">{column.label}</h2>
              </div>
              <div className="space-y-3">
                {tasks
                  .filter((task) => task.status === column.status)
                  .map((task) => (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-300 p-4 rounded-lg shadow-sm"
                    >
                      <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        {task.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
