import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import User from "@/models/User";
import Project from "@/models/Project";
import Quiz from "@/models/Quiz";
import Formation from "@/models/Formation";
import Certificate from "@/models/Certificate";

export async function GET() {
  try {
    await dbConnect();

    const [projects, quizzes, formations, users, certificates] = await Promise.all([
      Project.find().lean(),
      Quiz.find().lean(),
      Formation.find().lean(),
      User.find().lean(),
      Certificate.find().lean(),
    ]);

    const projectsCompleted = projects.filter((p) => p.status?.toLowerCase() === "terminé").length;
    const projectsInProgress = projects.filter((p) => p.status?.toLowerCase() === "en cours").length;
    const projectsPending = projects.filter((p) => p.status?.toLowerCase() === "à venir").length;

    // Nombre total de tentatives de quizzes
    const totalQuizAttempts = users.reduce((acc, user) => acc + (Array.isArray(user.quizzes) ? user.quizzes.length : 0), 0);
    // Nombre de tentatives réussies
    const quizzesPassed = users.reduce((acc, user) => {
      if (Array.isArray(user.quizzes)) {
        return acc + user.quizzes.filter((q: any) => {
          const quiz = quizzes.find((qz) => String(qz._id) === String(q.quiz));
          const passingScore = quiz?.passingScore || 50;
          return q.score !== undefined && typeof q.score === "number" && q.score >= passingScore;
        }).length;
      }
      return acc;
    }, 0);

    // Calculer la progression par utilisateur
    const userProgress = users.map((user) => {
      const userProjects = projects.filter((p) => String(p.takenBy) === String(user._id));
      const total = userProjects.length;
      const done = userProjects.filter((p) => p.status?.toLowerCase() === "terminé").length;
      return total === 0 ? 0 : Math.min((done / total) * 100, 100);
    });
    const avgUserProgress = userProgress.length > 0
      ? Math.round(userProgress.reduce((acc, p) => acc + p, 0) / userProgress.length)
      : 0;

    const recentActivity = users
      .flatMap((user) => {
        const name = user.name || user.email || "Utilisateur inconnu";
        return user.activity?.map((act: any) => ({
          user: name,
          action: act.action || "Action inconnue",
          date: new Date(act.date).toLocaleDateString() || "Date inconnue",
        })) || [];
      })
      .slice(-10)
      .reverse();

    return NextResponse.json({
      projects: projects.length,
      quizzes: { total: quizzes.length, attempts: totalQuizAttempts, passed: quizzesPassed }, // 'total' pour la carte, 'attempts' pour le taux
      formations: formations.length,
      users: users.length,
      certificates: certificates.length,
      avgUserProgress,
      projectsCompleted,
      projectsInProgress,
      projectsPending,
      recentActivity,
      userProgress: users.map((u, idx) => ({
        name: u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email || "Utilisateur inconnu",
        progress: userProgress[idx] || 0,
      })),
    });
  } catch (error) {
    console.error("Erreur route /api/admin/stats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques." },
      { status: 500 }
    );
  }
}