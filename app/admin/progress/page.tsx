"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Users, BookOpen, Code2, Star } from "lucide-react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  skills: string[];
  quizzes: Array<{ score: number }>;
  projectsTaken: Array<{ status: string }>;
}

interface Project {
  _id: string;
  status: string;
}

export default function AdminProgressPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Charge tous les users
      const usersRes = await fetch("/api/users");
      if (!usersRes.ok) throw new Error("Erreur récupération utilisateurs");
      const usersData: User[] = await usersRes.json();

      // Charge tous les projets
      const projectsRes = await fetch("/api/projects");
      if (!projectsRes.ok) throw new Error("Erreur récupération projets");
      const projectsData: Project[] = await projectsRes.json();

      setUsers(usersData);
      setProjects(projectsData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchAdminData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  // Calculs globaux

  const totalProjects = projects.length;

  const totalProjectsCompleted = projects.filter(
    (p) => p.status.toLowerCase() === "terminé"
  ).length;

  // Total quizzes passés par tous les users (somme des quizzes de chaque user)
  const totalQuizzesPassed = users.reduce(
    (acc, user) => acc + (user.quizzes?.length ?? 0),
    0
  );

  // Score moyen global sur tous les quizzes de tous les users
  let totalScoreSum = 0;
  let totalScoreCount = 0;
  users.forEach((user) => {
    user.quizzes.forEach((quiz) => {
      totalScoreSum += quiz.score;
      totalScoreCount++;
    });
  });
  const averageScoreGlobal = totalScoreCount ? totalScoreSum / totalScoreCount : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de Bord Admin - Progression Globale
          </h1>
          <Button onClick={fetchAdminData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </header>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-blue-600 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6" />
                <span>Utilisateurs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{users.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-green-600 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-6 h-6" />
                <span>Quizzes Passés</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalQuizzesPassed}</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-600 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code2 className="w-6 h-6" />
                <span>Projets Terminés</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalProjectsCompleted}</p>
              <p>Total projets: {totalProjects}</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-600 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-6 h-6" />
                <span>Score Moyen</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {averageScoreGlobal.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Liste utilisateurs et leurs compétences */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Compétences des Utilisateurs</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {users.map((user) => (
              <Card key={user._id}>
                <CardContent>
                  <h3 className="text-lg font-bold mb-1">
                    {user.firstName} {user.lastName}
                  </h3>
                  {user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-blue-200 text-blue-800"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="italic text-gray-500">Aucune compétence renseignée</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
