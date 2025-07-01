"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Code2,
  Target,
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  Star,
  Trophy,
  Zap,
  Users,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

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

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError("");

      // Récupérer l'ID utilisateur depuis localStorage
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("Utilisateur non connecté");
        setLoading(false);
        return;
      }

      // Récupérer toutes les données en parallèle
      const [userRes, projectsRes, quizzesRes, formationsRes] =
        await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch("/api/projects"),
          fetch("/api/quiz"),
          fetch("/api/Formation"),
        ]);

      if (!userRes.ok)
        throw new Error(
          "Erreur lors de la récupération des données utilisateur"
        );
      if (!projectsRes.ok)
        throw new Error("Erreur lors de la récupération des projets");
      if (!quizzesRes.ok)
        throw new Error("Erreur lors de la récupération des quizzes");
      if (!formationsRes.ok)
        throw new Error("Erreur lors de la récupération des formations");

      const userData = await userRes.json();
      const projectsData = await projectsRes.json();
      const quizzesData = await quizzesRes.json();
      const formationsData = await formationsRes.json();

      setUser(userData);
      setProjects(projectsData);
      setQuizzes(quizzesData);
      setFormations(formationsData);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const userProjects = projects.filter((p) => p.takenBy === user?._id);
  const completedProjects = userProjects.filter((p) => p.status === "terminé");
  const completedQuizzes = user?.quizzes?.length || 0;
  const averageQuizScore = user?.quizzes?.length
    ? user.quizzes.reduce((acc, q) => acc + q.score, 0) / user.quizzes.length
    : 0;

  const projectProgress =
    Math.round((userProjects.length / projects.length) * 100) || 0;

  const totalProgress =
    Math.round(
      ((completedProjects.length + completedQuizzes) /
        (projects.length + quizzes.length)) *
        100
    ) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">
                Chargement de votre progression...
              </p>
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
                <h1 className="text-2xl font-bold text-gray-900">
                  Mon Progrès
                </h1>
                <p className="text-gray-600">
                  Bienvenue, {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
            <Button onClick={fetchProgressData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
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
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      {userProjects.length} / {projects.length} projets pris
                    </div>
                    <Progress
                      value={projectProgress}
                      className="h-2 bg-blue-400"
                    />
                    <p className="text-blue-100 text-sm mt-2">Terminés</p>
                  </CardContent>
                </motion.div>

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
                    <div className="text-3xl font-bold mb-2">
                      {totalProgress}%
                    </div>
                    <Progress
                      value={totalProgress}
                      className="h-2 bg-orange-400"
                    />
                    <p className="text-orange-100 text-sm mt-2">Global</p>
                  </CardContent>
                </motion.div>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Activité Récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user?.quizzes
                      ?.slice(-3)
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
                            <p className="text-sm text-gray-600">
                              {project.title}
                            </p>
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

          {activeTab === "projects" && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code2 className="w-5 h-5 mr-2" />
                    Mes Projets ({userProjects.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userProjects.map((project) => (
                      <Card
                        key={project._id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {project.title}
                          </CardTitle>
                          <CardDescription>
                            {project.technologies.join(", ")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Difficulté:
                              </span>
                              <Badge
                                variant={
                                  project.difficulty === "Beginner"
                                    ? "secondary"
                                    : project.difficulty === "Intermediate"
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {project.difficulty}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Statut:
                              </span>
                              <Badge
                                variant={
                                  project.status === "terminé"
                                    ? "default"
                                    : project.status === "en cours"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {project.status}
                              </Badge>
                            </div>
                            <div className="pt-2">
                              <p className="text-sm text-gray-600 mb-2">
                                Objectifs:
                              </p>
                              <div className="space-y-1">
                                {project.objectives
                                  .slice(0, 2)
                                  .map((objective, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center text-xs text-gray-500"
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                      {objective}
                                    </div>
                                  ))}
                                {project.objectives.length > 2 && (
                                  <p className="text-xs text-gray-400">
                                    +{project.objectives.length - 2} autres
                                    objectifs
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "quizzes" && (
            <motion.div
              key="quizzes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Mes Quizzes ({completedQuizzes}/{quizzes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {user?.quizzes?.map((userQuiz, index) => {
                      const quiz = quizzes.find((q) => q._id === userQuiz.quiz);
                      return (
                        <Card
                          key={index}
                          className="hover:shadow-lg transition-shadow"
                        >
                          <CardHeader>
                            <CardTitle className="text-lg">
                              {quiz?.title || "Quiz"}
                            </CardTitle>
                            <CardDescription>
                              {quiz?.description ||
                                "Description non disponible"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  Score:
                                </span>
                                <Badge
                                  variant={
                                    userQuiz.score >= 90
                                      ? "default"
                                      : userQuiz.score >= 70
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {userQuiz.score}%
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  Date:
                                </span>
                                <span className="text-sm text-gray-500">
                                  {new Date(userQuiz.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="pt-2">
                                <div className="flex items-center justify-center">
                                  {userQuiz.score >= 90 ? (
                                    <div className="text-center">
                                      <span className="text-4xl mb-2">🏆</span>
                                      <p className="font-semibold text-yellow-800">
                                        Expert Quiz
                                      </p>
                                      <p className="text-xs text-yellow-700">
                                        Score &gt; 90%
                                      </p>
                                    </div>
                                  ) : userQuiz.score >= 70 ? (
                                    <div className="text-center">
                                      <span className="text-4xl mb-2">🥈</span>
                                      <p className="font-semibold text-gray-800">
                                        Bon Score
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        Score &gt; 70%
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="text-center">
                                      <span className="text-4xl mb-2">📚</span>
                                      <p className="font-semibold text-blue-800">
                                        À améliorer
                                      </p>
                                      <p className="text-xs text-blue-600">
                                        Score &lt; 70%
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "formations" && (
            <motion.div
              key="formations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Formations Disponibles ({formations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {formations.map((formation) => (
                      <Card
                        key={formation._id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {formation.title}
                          </CardTitle>
                          <CardDescription>
                            {formation.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Niveau:
                              </span>
                              <Badge variant="outline">{formation.level}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Durée:
                              </span>
                              <span className="text-sm text-gray-500">
                                {formation.duration}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Catégorie:
                              </span>
                              <Badge variant="secondary">
                                {formation.category}
                              </Badge>
                            </div>
                            <Button className="w-full" variant="outline">
                              Commencer
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "skills" && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Mes Compétences ({user?.skills?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {user?.skills?.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-center py-2"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {user?.cvUrl && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">
                          CV Uploadé
                        </h3>
                        <p className="text-blue-700 text-sm mb-3">
                          Votre CV a été analysé et les compétences ont été
                          extraites automatiquement.
                        </p>
                        <Button variant="outline" size="sm">
                          <Zap className="w-4 h-4 mr-2" />
                          Voir le CV
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
