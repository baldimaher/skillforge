"use client";

import {
  BookOpen,
  Code2,
  FileText,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Star,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

interface UserProgressData {
  user: {
    email: string;
    firstName: string;
    lastName: string;
    skills: string[];
    cvUrl?: string;
  };
  statistics: {
    completedQuizzes: number;
    passedQuizzes: number;
    averageScore: number;
    totalXP: number;
  };
  quizResults: Array<{
    quizId: string;
    quizTitle: string;
    score: number;
    passed: boolean;
    completedAt: string;
    difficulty: string;
  }>;
}

interface Project {
  _id: string;
  title: string;
  difficulty: string;
  technologies: string[];
  createdAt: string;
}

interface Quiz {
  _id: string;
  title: string;
  difficulty: string;
  category: string;
}

export default function ProgressPage() {
  const [userProgress, setUserProgress] = useState<UserProgressData | null>(
    null
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer l'email depuis localStorage
        let userEmail = localStorage.getItem("email");

        if (!userEmail) {
          const userObj = localStorage.getItem("user");
          if (userObj) {
            try {
              const parsedUser = JSON.parse(userObj);
              userEmail = parsedUser.email;
            } catch (e) {
              console.error("Erreur parsing user object:", e);
            }
          }
        }

        if (!userEmail) {
          setError("Aucun utilisateur connecté. Veuillez vous reconnecter.");
          setLoading(false);
          return;
        }

        // Récupérer les données utilisateur
        const userResponse = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserProgress(userData);
        } else {
          setError("Erreur lors du chargement des données utilisateur");
        }

        // Récupérer les projets et quiz
        const [projectsRes, quizzesRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/quiz"),
        ]);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }

        if (quizzesRes.ok) {
          const quizzesData = await quizzesRes.json();
          setAllQuizzes(quizzesData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-200 rounded-full animate-ping mx-auto"></div>
          </div>
          <p className="text-slate-600 text-lg font-medium">
            Chargement de vos données...
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Préparation de votre tableau de bord
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <FileText className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops !</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = userProgress?.statistics || {
    completedQuizzes: 0,
    passedQuizzes: 0,
    averageScore: 0,
    totalXP: 0,
  };

  const userData = userProgress?.user;
  const totalQuizzes = allQuizzes.length;
  const recentQuizzes = Array.isArray(userProgress?.quizResults)
    ? userProgress.quizResults.slice(0, 5)
    : [];

  // Calculer le niveau
  const getLevel = (xp: number) => {
    if (xp >= 2000)
      return {
        name: "Expert",
        color: "from-yellow-400 to-orange-500",
        icon: "👑",
      };
    if (xp >= 1000)
      return {
        name: "Avancé",
        color: "from-purple-400 to-pink-500",
        icon: "🚀",
      };
    if (xp >= 500)
      return {
        name: "Intermédiaire",
        color: "from-blue-400 to-cyan-500",
        icon: "⭐",
      };
    return {
      name: "Débutant",
      color: "from-green-400 to-emerald-500",
      icon: "🌱",
    };
  };

  const currentLevel = getLevel(stats.totalXP);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* En-tête Hero avec design moderne */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl">
          {/* Motifs décoratifs animés */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16 animate-bounce"></div>
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white rounded-full animate-ping"></div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <span className="text-3xl">👋</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    Salut {userData?.firstName || "Utilisateur"} !
                  </h1>
                  <p className="text-blue-100 text-xl">
                    Continuez votre parcours d'apprentissage
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right space-y-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 border border-white/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{currentLevel.icon}</span>
                  <div>
                    <div className="text-4xl font-bold">{stats.totalXP}</div>
                    <p className="text-blue-100 text-sm uppercase tracking-wide">
                      Points XP
                    </p>
                  </div>
                </div>
                <div
                  className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${currentLevel.color} text-white text-sm font-medium shadow-lg`}
                >
                  Niveau {currentLevel.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales avec design moderne */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Quiz Complétés */}
          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="border-0 shadow-lg hover:shadow-2xl bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-900">
                      {stats.completedQuizzes}
                    </div>
                    <p className="text-sm text-green-600 font-medium">
                      Quiz Complétés
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-green-700">
                    sur {totalQuizzes} disponibles
                  </p>
                  <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${
                          totalQuizzes > 0
                            ? (stats.completedQuizzes / totalQuizzes) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Progression</span>
                    <span>
                      {totalQuizzes > 0
                        ? Math.round(
                            (stats.completedQuizzes / totalQuizzes) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score Moyen */}
          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="border-0 shadow-lg hover:shadow-2xl bg-gradient-to-br from-purple-50 to-violet-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-900">
                      {stats.averageScore}%
                    </div>
                    <p className="text-sm text-purple-600 font-medium">
                      Score Moyen
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-purple-700">
                    {stats.passedQuizzes} quiz réussis
                  </p>
                  <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-violet-600 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${stats.averageScore}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-purple-600">
                    <span>Performance</span>
                    <span>
                      {stats.averageScore >= 80
                        ? "Excellent"
                        : stats.averageScore >= 60
                        ? "Bien"
                        : "À améliorer"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projets */}
          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="border-0 shadow-lg hover:shadow-2xl bg-gradient-to-br from-orange-50 to-amber-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl shadow-lg">
                    <Code2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-900">
                      {projects.length}
                    </div>
                    <p className="text-sm text-orange-600 font-medium">
                      Projets
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-orange-700">projets disponibles</p>
                  <div className="flex gap-1 flex-wrap">
                    {[...Array(Math.min(projects.length, 8))].map((_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      ></div>
                    ))}
                    {projects.length > 8 && (
                      <span className="text-xs text-orange-600 ml-1 font-medium">
                        +{projects.length - 8}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-orange-600">
                    <span>Explorez de nouveaux défis !</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activité récente avec design moderne */}
        {recentQuizzes.length > 0 && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Activité Récente
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Vos derniers quiz complétés
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentQuizzes.map((quiz, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-slate-200/50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-2xl shadow-lg ${
                          quiz.passed
                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                            : "bg-gradient-to-r from-red-500 to-rose-600"
                        }`}
                      >
                        {quiz.passed ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <Clock className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors">
                          {quiz.quizTitle}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(quiz.completedAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-2xl font-bold text-slate-900">
                        {quiz.score}%
                      </div>
                      <Badge
                        variant={quiz.passed ? "default" : "destructive"}
                        className={`text-xs font-medium ${
                          quiz.passed
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                        }`}
                      >
                        {quiz.passed ? "✓ Réussi" : "✗ Échoué"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compétences CV avec design moderne */}
        {userData?.skills && userData.skills.length > 0 && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Vos Compétences
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    {userData.skills.length} technologies extraites de votre CV
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {userData.skills.map((skill, index) => (
                  <div key={index} className="group relative">
                    <Badge
                      variant="outline"
                      className="text-sm py-2 px-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-300 transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                    >
                      <span className="mr-2">⚡</span>
                      {skill}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                <p className="text-sm text-indigo-700 text-center font-medium">
                  🎯 Continuez à développer vos compétences avec nos quiz et
                  projets !
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
