"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  Code2,
  RefreshCw,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Award,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState, useCallback } from "react";

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  skills: string[];
  cvUrl?: string;
  quizzes: Array<{
    quiz: string;
    score: number;
    date: string;
    title?: string;
  }>;
  projectsTaken: string[];
  createdAt: string;
}

interface Project {
  _id: string;
  title: string;
  difficulty: string;
  status: string;
  technologies: string[];
  objectives: string[];
  createdAt: string;
  updatedAt: string;
  takenBy?: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: any[];
  difficulty: string;
  category: string;
}

interface Formation {
  _id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  category: string;
}

export default function ProgressPage() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const fetchProgressData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("Utilisateur non connecté");
        setLoading(false);
        return;
      }

      const [userRes, projectsRes, quizzesRes, formationsRes] =
        await Promise.all([
          fetch(`/api/user/${userId}`),
          fetch("/api/projects"),
          fetch("/api/quiz"),
          fetch("/api/Formation"),
        ]);

      if (!userRes.ok) throw new Error("Erreur récupération utilisateur");
      if (!projectsRes.ok) throw new Error("Erreur récupération projets");
      if (!quizzesRes.ok) throw new Error("Erreur récupération quizzes");
      if (!formationsRes.ok) throw new Error("Erreur récupération formations");

      const userData = await userRes.json();
      const projectsData = await projectsRes.json();
      const quizzesData = await quizzesRes.json();
      const formationsData = await formationsRes.json();

      setUser(userData);
      setProjects(projectsData);
      setQuizzes(quizzesData);
      setFormations(formationsData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  const refreshProgress = () => {
    fetchProgressData();
  };

  // Après loading et error, si user est null, on affiche un message simple
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Chargement de votre progression...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchProgressData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <p className="text-gray-700 text-lg">Utilisateur non trouvé.</p>
      </div>
    );
  }

  // Maintenant user est garanti non nul, on peut accéder sans erreurs TS

  const userProjects = projects.filter((p) => p.takenBy === user._id);
  const completedProjects = userProjects.filter((p) => p.status === "terminé");

  const completedQuizzes = user.quizzes.length;

  const averageQuizScore = user.quizzes.length
    ? user.quizzes.reduce((acc, q) => acc + q.score, 0) / user.quizzes.length
    : 0;

  const projectsProgress = projects.length
    ? Math.min((completedProjects.length / projects.length) * 100, 100)
    : 0;

  const quizzesProgress = quizzes.length
    ? Math.min((completedQuizzes / quizzes.length) * 100, 100)
    : 0;

  const totalProgress = Math.round(
    Math.min((projectsProgress + quizzesProgress) / 2, 100)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon Progrès</h1>
                <p className="text-gray-600">
                  Bienvenue, {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
            <Button onClick={refreshProgress} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8 shadow-sm">
          {[
            { id: "overview", label: "Vue d'ensemble", icon: TrendingUp },
            { id: "projects", label: "Projets", icon: Code2 },
            { id: "quizzes", label: "Quizzes", icon: BookOpen },
            { id: "formations", label: "Formations", icon: Target },
            { id: "skills", label: "Compétences", icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Progress overview cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Projets */}
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  whileHover={{
                    scale: 1.04,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                  }}
                  className="rounded-2xl shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 flex flex-col items-center text-white relative overflow-hidden"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Code2 className="w-5 h-5 mr-2" />
                      Projets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {completedProjects.length} / {projects.length} terminés
                    </div>
                    <Progress value={projectsProgress} className="h-2 bg-blue-400" />
                    <p className="text-blue-100 text-sm mt-2">Terminés</p>
                  </CardContent>
                </motion.div>

                {/* Quizzes */}
                <motion.div
                  key="quizzes"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  whileHover={{
                    scale: 1.04,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                  }}
                  className="rounded-2xl shadow-xl bg-gradient-to-br from-green-500 to-green-600 p-6 flex flex-col items-center text-white relative overflow-hidden"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Quizzes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {completedQuizzes}/{quizzes.length}
                    </div>
                    <Progress
                      value={(completedQuizzes / quizzes.length) * 100 || 0}
                      className="h-2 bg-green-400"
                    />
                    <p className="text-green-100 text-sm mt-2">Réussis</p>
                  </CardContent>
                </motion.div>

                {/* Score moyen */}
                <motion.div
                  key="averageQuizScore"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  whileHover={{
                    scale: 1.04,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                  }}
                  className="rounded-2xl shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 flex flex-col items-center text-white relative overflow-hidden"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Star className="w-5 h-5 mr-2" />
                      Score Moyen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {averageQuizScore.toFixed(0)}%
                    </div>
                    <div className="flex items-center text-purple-100 text-sm">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Performance
                    </div>
                  </CardContent>
                </motion.div>

                {/* Progression totale */}
                <motion.div
                  key="totalProgress"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  whileHover={{
                    scale: 1.04,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                  }}
                  className="rounded-2xl shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 flex flex-col items-center text-white relative overflow-hidden"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Trophy className="w-5 h-5 mr-2" />
                      Progression
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{totalProgress}%</div>
                    <Progress value={totalProgress} className="h-2 bg-orange-400" />
                    <p className="text-orange-100 text-sm mt-2">Global</p>
                  </CardContent>
                </motion.div>
              </div>

              {/* Activité récente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Activité Récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.quizzes
                      .slice(-3)
                      .reverse()
                      .map((quiz, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Quiz complété</p>
                              <p className="text-sm text-gray-600">
                                Score: {quiz.score}% -{" "}
                                {new Date(quiz.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">{quiz.score}%</Badge>
                        </div>
                      ))}
                    {completedProjects.slice(-2).map((project, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Code2 className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Projet terminé</p>
                            <p className="text-sm text-gray-600">{project.title}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Terminé</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Onglet Projets */}
          {activeTab === "projects" && (
            <motion.div
              key="projectsTab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold mb-4">Mes Projets</h2>
              {userProjects.length === 0 ? (
                <p>Aucun projet pris.</p>
              ) : (
                <ul>
                  {userProjects.map((p) => (
                    <li
                      key={p._id}
                      className="mb-2 p-3 border rounded bg-white shadow-sm"
                    >
                      <h3 className="font-semibold">{p.title}</h3>
                      <p>Status: {p.status}</p>
                      <p>Difficulté: {p.difficulty}</p>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}

          {/* Onglet Quizzes */}
          {activeTab === "quizzes" && (
            <motion.div
              key="quizzesTab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold mb-4">Mes Quizzes</h2>
              {(user.quizzes.length ?? 0) === 0 ? (
                <p>Aucun quiz passé.</p>
              ) : (
                <ul>
                  {user.quizzes.map((q, i) => (
                    <li
                      key={i}
                      className="mb-2 p-3 border rounded bg-white shadow-sm"
                    >
                      <h3>{q.title || "Quiz sans titre"}</h3>
                      <p>Score: {q.score}%</p>
                      <p>Date: {new Date(q.date).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}

          {/* Onglet Formations */}
          {activeTab === "formations" && (
            <motion.div
              key="formationsTab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold mb-4">Formations disponibles</h2>
              {formations.length === 0 ? (
                <p>Aucune formation disponible.</p>
              ) : (
                <ul>
                  {formations.map((f) => (
                    <li
                      key={f._id}
                      className="mb-2 p-3 border rounded bg-white shadow-sm"
                    >
                      <h3>{f.title}</h3>
                      <p>Durée: {f.duration}</p>
                      <p>Niveau: {f.level}</p>
                      <p>{f.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}

          {/* Onglet Compétences */}
          {activeTab === "skills" && (
            <motion.div
              key="skillsTab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold mb-4">Mes Compétences</h2>
              {(user.skills?.length ?? 0) === 0 ? (
                <p>Aucune compétence renseignée.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {user.skills.map((skill, i) => (
                    <li
                      key={i}
                      className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
