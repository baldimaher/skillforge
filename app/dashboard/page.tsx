"use client";

import { AnimatePresence, TargetAndTransition, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Stats {
  projects: number;
  quizzes: number;
  formations: number;
  users: number;
  certificates: number;
}

interface Project {
  _id: string;
  title: string;
  status: string;
  takenBy?: string;
}

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

function Loader() {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-transparent border-t-violet-500 border-r-violet-300 rounded-full animate-spin"></div>
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-indigo-400 border-r-indigo-200 rounded-full animate-spin animate-reverse"></div>
      </div>
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
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
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

      const [projectsRes, quizzesRes, formationsRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/quiz"),
        fetch("/api/Formation"),
      ]);

      const [projects, quizzes, formations] = await Promise.all([
        getJsonSafe(projectsRes),
        getJsonSafe(quizzesRes),
        getJsonSafe(formationsRes),
      ]);

      let totalUsers = 0;
      if (parsedUser?.role === "admin") {
        const usersRes = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: parsedUser.email }),
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          totalUsers = usersData.totalUsers || 0;
        }
      }

      let certificatesCount = 0;
      if (parsedUser?.role === "admin") {
        const certRes = await fetch("/api/certificates/count");
        if (certRes.ok) {
          const certData = await certRes.json();
          certificatesCount = certData.totalCertificates || 0;
        }
      } else if (parsedUser?.certificates && Array.isArray(parsedUser.certificates)) {
        certificatesCount = parsedUser.certificates.length;
      }

      const filteredProjects =
        parsedUser?.role === "admin"
          ? projects
          : projects.filter(
              (project: Project) => String(project.takenBy) === String(parsedUser?._id)
            );

      setStats({
        projects: filteredProjects.length,
        quizzes: quizzes.length,
        formations: formations.length,
        users: totalUsers,
        certificates: certificatesCount,
      });

      setUserProjects(filteredProjects.slice(0, 5));

      // --- Récupérer les feedbacks ---
      const feedbackRes = await fetch("/api/feedback");
      let allFeedbacks: Feedback[] = [];
      if (feedbackRes.ok) {
        allFeedbacks = await feedbackRes.json();
      }

      // Filtrer selon rôle utilisateur
      if (parsedUser?.role === "admin") {
        setFeedbacks(allFeedbacks);
      } else {
        setFeedbacks(allFeedbacks.filter(fb => fb.userId?._id === parsedUser._id));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-12">
        {/* Header avec effet glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative backdrop-blur-sm bg-white/30 rounded-3xl p-8 border border-white/20 shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 rounded-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-black bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Tableau de bord
            </h1>
            {user && (
              <p className="text-2xl font-semibold text-slate-700/80">
                Bonjour, <span className="text-indigo-600">{user.firstName || user.name || "Utilisateur"}</span> {user.lastName || ""}
              </p>
            )}
          </div>
        </motion.div>

        {/* Navigation rapide pour utilisateurs */}
        {user?.role !== "admin" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-sm bg-white/40 rounded-2xl p-6 border border-white/30 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">📂</span> Mes données
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/user/Mesproject" className="group">
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-center py-6 rounded-2xl shadow-xl font-bold text-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="text-3xl mb-2">🚀</div>
                  Mes Projets
                </div>
              </Link>
              <Link href="/user/mesCertificats" className="group">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-center py-6 rounded-2xl shadow-xl font-bold text-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                <div className="text-3xl mb-2">🎓</div>
                Mes Certificats
              </div>
            </Link>

              <Link href="/user/MesQuiz" className="group">
                <div className="bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-center py-6 rounded-2xl shadow-xl font-bold text-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="text-3xl mb-2">🧠</div>
                  Mes Quiz
                </div>
              </Link>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="backdrop-blur-sm bg-white/30 rounded-3xl p-12 border border-white/20 shadow-xl">
            <Loader />
          </div>
        ) : (
          <>
            {/* Statistiques avec design moderne */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6"
              initial="hidden"
              animate="visible"
            >
              {/* Projets */}
              <motion.div
                custom={0}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="text-6xl font-black mb-3 drop-shadow-lg">{stats?.projects}</div>
                  <div className="text-xl font-bold tracking-wide">Projets</div>
                </div>
                <div className="absolute -bottom-6 -right-6 text-9xl font-black opacity-10 select-none">P</div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </motion.div>

              {/* Quiz */}
              <motion.div
                custom={1}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="text-6xl font-black mb-3 drop-shadow-lg">{stats?.quizzes}</div>
                  <div className="text-xl font-bold tracking-wide">Quiz</div>
                </div>
                <div className="absolute -bottom-6 -right-6 text-9xl font-black opacity-10 select-none">Q</div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </motion.div>

              {/* Formations */}
              <motion.div
                custom={2}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 p-8 text-white"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="text-6xl font-black mb-3 drop-shadow-lg">{stats?.formations}</div>
                  <div className="text-xl font-bold tracking-wide">Formations</div>
                </div>
                <div className="absolute -bottom-6 -right-6 text-9xl font-black opacity-10 select-none">F</div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </motion.div>

              {/* Certificats */}
              <motion.div
                custom={3}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 text-white"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="text-6xl font-black mb-3 drop-shadow-lg">{stats?.certificates}</div>
                  <div className="text-xl font-bold tracking-wide">Certificats</div>
                </div>
                <div className="absolute -bottom-6 -right-6 text-7xl opacity-20 select-none">🎓</div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </motion.div>

              {/* Utilisateurs - admin uniquement */}
              {user?.role === "admin" && (
                <motion.div
                  custom={4}
                  variants={cardVariants}
                  className="group relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 p-8 text-white"
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="text-6xl font-black mb-3 drop-shadow-lg">{stats?.users}</div>
                    <div className="text-xl font-bold tracking-wide">Utilisateurs</div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 text-9xl font-black opacity-10 select-none">U</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </motion.div>
              )}
            </motion.div>

            {/* Projets récents avec design moderne */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-sm bg-white/40 rounded-3xl p-8 border border-white/30 shadow-xl"
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                {user?.role === "admin" ? "Tous les projets" : "Mes projets récents"}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {userProjects.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="text-6xl mb-4 opacity-50">📋</div>
                      <p className="text-xl text-slate-600">
                        {user?.role === "admin"
                          ? "Aucun projet trouvé."
                          : "Vous n'avez pas encore pris de projets."}
                      </p>
                    </div>
                  ) : (
                    userProjects.map((project, i) => (
                      <motion.div
                        key={project._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 70 }}
                        className="group"
                      >
                        <Card className="h-full border-0 shadow-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl rounded-2xl overflow-hidden">
                          <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 pb-4">
                            <CardTitle className="text-xl text-slate-800 font-bold">{project.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-700">Statut :</span>
                              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                                {project.status}
                              </span>
                            </div>
                            <Link href={`/projects/${project._id}`}>
                              <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                                Voir détails
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Section Feedbacks moderne */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-sm bg-white/40 rounded-3xl p-8 border border-white/30 shadow-xl"
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-pink-500 to-rose-600 rounded-full"></div>
                {user?.role === "admin" ? "Tous les avis des utilisateurs" : "Mes avis"}
              </h2>
              {feedbacks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-50">💬</div>
                  <p className="text-xl text-slate-600">
                    {user?.role === "admin"
                      ? "Aucun avis pour le moment."
                      : "Vous n'avez pas encore laissé d'avis."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {feedbacks.map((fb, index) => (
                    <motion.div 
                      key={fb._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/60 backdrop-blur-sm border border-white/40 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-lg text-indigo-700">
                          {fb.userId?.firstName} {fb.userId?.lastName}
                        </p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-lg ${i < fb.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-700 mb-3 text-lg leading-relaxed">{fb.comment}</p>
                      <small className="text-slate-500 font-medium">
                        {new Date(fb.createdAt).toLocaleDateString('fr-FR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </small>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Actions rapides admin avec design moderne */}
            {user?.role === "admin" && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="backdrop-blur-sm bg-white/40 rounded-3xl p-8 border border-white/30 shadow-xl"
              >
                <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                  Actions rapides
                </h2>
                <div className="flex flex-wrap gap-6">
                  <Link href="/admin/addproject" className="group">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl shadow-xl font-bold text-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                      <span className="mr-2 text-xl">➕</span>
                      Ajouter un projet
                    </Button>
                  </Link>
                  <Link href="/admin/addquiz" className="group">
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl shadow-xl font-bold text-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                      <span className="mr-2 text-xl">➕</span>
                      Ajouter un quiz
                    </Button>
                  </Link>
                  <Link href="/admin/addformation" className="group">
                    <Button className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-8 py-4 rounded-2xl shadow-xl font-bold text-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                      <span className="mr-2 text-xl">➕</span>
                      Ajouter une formation
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}