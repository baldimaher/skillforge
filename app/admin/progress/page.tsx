"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Code2,
  BookOpen,
  Award,
  Users,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

export default function AdminProgressPage() {
  const [stats, setStats] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        console.log("Stats API response:", data);
        setStats(data);
      })
      .catch((e) => console.error("Erreur chargement stats", e));

    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => {
        console.log("Progress API response:", data);
        const currentUserId = localStorage.getItem("userId");
        const filteredProgress = data.filter((u: any) => String(u.userId) !== currentUserId);
        setUserProgress(filteredProgress);
      })
      .catch((e) => console.error("Erreur chargement progression", e));
  }, []);

  if (!stats || !userProgress) {
    return <div className="text-center py-20 text-gray-600">Chargement...</div>;
  }

  const cards = [
    { label: "Projets", value: stats.projects, icon: <Code2 className="w-5 h-5 mr-2" />, bg: "bg-indigo-600" },
    { label: "Quizzes", value: stats.quizzes.total, icon: <BookOpen className="w-5 h-5 mr-2" />, bg: "bg-emerald-500" },
    { label: "Formations", value: stats.formations, icon: <Award className="w-5 h-5 mr-2" />, bg: "bg-pink-500" },
    { label: "Certificats", value: stats.certificates, icon: <CheckCircle className="w-5 h-5 mr-2" />, bg: "bg-orange-500" },
    { label: "Utilisateurs", value: stats.users, icon: <Users className="w-5 h-5 mr-2" />, bg: "bg-yellow-500" },
  ];

  const quizSuccessRate = stats.quizzes.attempts > 0
    ? Math.min((stats.quizzes.passed / stats.quizzes.attempts) * 100, 100)
    : 0;

  return (
    <section className="p-6">
      <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-800">Statistiques Administrateur</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <AnimatePresence>
          {cards.map((card, idx) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`${card.bg} text-white shadow-md rounded-xl`}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">{card.icon} {card.label}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-3xl font-bold">{card.value}</CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-2">Progression globale</h3>
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${stats.avgUserProgress}%` }} />
        </div>
        <div className="text-right text-sm mt-1 text-gray-600">{stats.avgUserProgress}%</div>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-2">Taux de réussite aux quizzes</h3>
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${quizSuccessRate}%` }} />
        </div>
        <div className="text-right text-sm mt-1 text-gray-600">{stats.quizzes.passed} / {stats.quizzes.attempts} ({quizSuccessRate.toFixed(1)}%)</div>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-2">Répartition des projets</h3>
        <ul className="flex flex-wrap gap-6 text-gray-700">
          <li>✅ <b>Terminés :</b> {stats.projectsCompleted}</li>
          <li>🔄 <b>En cours :</b> {stats.projectsInProgress}</li>
          <li>⏳ <b>À venir :</b> {stats.projectsPending}</li>
        </ul>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Activité récente</h3>
        <ul className="divide-y divide-gray-200 bg-white shadow rounded-lg overflow-hidden">
          {stats.recentActivity.map((act: any, idx: number) => (
            <li key={idx} className="px-4 py-3 flex justify-between text-sm text-gray-700">
              <span className="font-semibold">{act.user}</span>
              <span>{act.action}</span>
              <span className="text-gray-500">{act.date}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Progression par utilisateur</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="py-2 px-4">Utilisateur</th>
                <th className="py-2 px-4">Progression (%)</th>
              </tr>
            </thead>
            <tbody>
              {userProgress.map((u: any, idx: number) => (
                <tr key={idx} className="border-t">
                  <td className="py-2 px-4">{u.name}</td>
                  <td className="py-2 px-4">{u.progress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}