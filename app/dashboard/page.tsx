"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, TargetAndTransition } from "framer-motion";

interface Stats {
  projects: number;
  quizzes: number;
  formations: number;
  users: number;
}

interface Project {
  _id: string;
  title: string;
  status: string;
  takenBy?: string;
}

function Loader() {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="w-12 h-12 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );
}

const cardVariants: {
  hidden: TargetAndTransition;
  visible: (i: number) => TargetAndTransition;
} = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, type: "spring", stiffness: 80 },
  }),
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const parsedUser = userStr ? JSON.parse(userStr) : null;
    setUser(parsedUser);

    const getJsonSafe = async (res: Response) => {
      if (!res.ok) return [];
      try {
        return await res.json();
      } catch {
        return [];
      }
    };

    const fetchData = async () => {
      setLoading(true);

      const [projectsRes, quizzesRes, formationsRes, usersRes] =
        await Promise.all([
          fetch("/api/projects"),
          fetch("/api/quiz"),
          fetch("/api/Formation"),
          fetch("/api/users"),
        ]);

      const [projects, quizzes, formations, users] = await Promise.all([
        getJsonSafe(projectsRes),
        getJsonSafe(quizzesRes),
        getJsonSafe(formationsRes),
        getJsonSafe(usersRes),
      ]);

      // Filtrer uniquement les projets pris par l'utilisateur connecté
      const filteredProjects = projects.filter(
        (project: Project) => project.takenBy === parsedUser?._id
      );

      setStats({
        projects: filteredProjects.length,
        quizzes: quizzes.length,
        formations: formations.length,
        users: users.length,
      });

      setUserProjects(filteredProjects.slice(0, 5));
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      <h1 className="text-4xl font-extrabold text-indigo-700 mb-6 tracking-tight">
        Tableau de bord
      </h1>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Statistiques */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
          >
            {[
              {
                title: "Mes projets",
                value: stats?.projects,
                color: "from-indigo-500 to-blue-400",
              },
              {
                title: "Quiz",
                value: stats?.quizzes,
                color: "from-green-500 to-emerald-400",
              },
              {
                title: "Formations",
                value: stats?.formations,
                color: "from-pink-500 to-rose-400",
              },
          
            ].map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                variants={cardVariants}
                className={`rounded-2xl shadow-xl bg-gradient-to-br ${item.color} p-6 flex flex-col items-center text-white relative overflow-hidden`}
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                }}
              >
                <span className="text-5xl font-extrabold drop-shadow">
                  {item.value}
                </span>
                <span className="text-lg font-semibold mt-2 tracking-wide">
                  {item.title}
                </span>
                <motion.div
                  className="absolute bottom-0 right-0 opacity-10 text-8xl font-black select-none pointer-events-none"
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                >
                  {item.title[0]}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Projets récents de l'utilisateur */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
              Mes projets récents
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <AnimatePresence>
                {userProjects.length === 0 && (
                  <p className="text-center text-gray-500 col-span-full">
                    Vous n'avez pas encore pris de projets.
                  </p>
                )}
                {userProjects.map((project, i) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{
                      delay: i * 0.1,
                      type: "spring",
                      stiffness: 70,
                    }}
                  >
                    <Card className="hover:shadow-2xl transition border rounded-xl bg-white/90">
                      <CardHeader>
                        <CardTitle className="text-lg text-indigo-700">
                          {project.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-gray-700">
                        <div>
                          <span className="font-medium">Statut :</span>{" "}
                          {project.status}
                        </div>
                        <Link href={`/projects/${project._id}`}>
                          <Button className="mt-3" variant="outline">
                            Voir détails
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Activité récente */}
          {userProjects.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Activité récente</h2>
              <ul className="space-y-3 text-gray-700 max-w-md">
                {userProjects.slice(0, 3).map((p) => (
                  <li
                    key={p._id}
                    className="border p-3 rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex justify-between">
                      <span>{p.title}</span>
                      <span className="text-sm italic text-gray-400">
                        {p.status}
                      </span>
                    </div>
                    <Link
                      href={`/projects/${p._id}`}
                      className="text-indigo-600 hover:underline"
                    >
                      Voir détails
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Progression générale */}
          <div className="mt-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Progression générale</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Projets pris</label>
                <div className="w-full bg-gray-200 rounded-full h-5">
                  <div
                    className="bg-indigo-600 h-5 rounded-full transition-all"
                    style={{
                      width: `${(stats?.projects / 20) * 100}%`,
                      maxWidth: "100%",
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Quiz disponibles
                </label>
                <div className="w-full bg-gray-200 rounded-full h-5">
                  <div
                    className="bg-green-600 h-5 rounded-full transition-all"
                    style={{
                      width: `${(stats?.quizzes / 50) * 100}%`,
                      maxWidth: "100%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Récompenses */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Récompenses</h2>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-yellow-300 p-4 rounded-lg shadow-md flex flex-col items-center w-32">
                <span className="text-4xl">🏆</span>
                <p className="font-semibold mt-2">Expert Quiz</p>
              </div>
              <div className="bg-blue-300 p-4 rounded-lg shadow-md flex flex-col items-center w-32">
                <span className="text-4xl">🎯</span>
                <p className="font-semibold mt-2">Projets pris</p>
              </div>
            </div>
          </div>

          {/* Nouveautés */}
          <div className="mt-12 p-6 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl shadow-inner max-w-md">
            <h3 className="text-lg font-semibold mb-2">Nouveautés</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li>Ajout d’un nouveau quiz sur React.js 🚀</li>
              <li>Nouvelle formation sur DevOps disponible 🔥</li>
              <li>Projets mis à jour avec des défis supplémentaires</li>
            </ul>
          </div>

          {/* Actions Admin */}
          {user?.role === "admin" && (
            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Actions rapides
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link href="/admin/addproject">
                  <Button
                    variant="default"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    ➕ Ajouter un projet
                  </Button>
                </Link>
                <Link href="/admin/addquiz">
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    ➕ Ajouter un quiz
                  </Button>
                </Link>
                <Link href="/admin/addformation">
                  <Button
                    variant="default"
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    ➕ Ajouter une formation
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
