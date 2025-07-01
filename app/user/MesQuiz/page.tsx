"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";

interface QuizType {
  _id: string;
  title: string;
  passingScore: number;
}

interface UserQuizResult {
  _id: string;
  quiz: string;
  score: number;
  title?: string;
  date: string;
}

interface UserType {
  _id: string;
  quizzes?: UserQuizResult[];
}

export default function MesQuiz() {
  const [user, setUser] = useState<UserType | null>(null);
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [loading, setLoading] = useState(true);

  // Nouveaux états pour la recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setUser(null);
      setLoading(false);
      return;
    }
    const userObj: UserType = JSON.parse(userStr);
    setUser(userObj);

    fetch("/api/quiz", {
      headers: {
        authorization: userObj._id,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur API");
        return res.json();
      })
      .then((data: QuizType[]) => {
        setQuizzes(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement...</p>;

  if (!user || !user.quizzes || user.quizzes.length === 0)
    return <p>Vous n'avez pas encore passé de quiz.</p>;

  // Associer chaque quiz passé aux infos complètes du quiz
  const userQuizResults = user.quizzes.map((result) => {
    const quiz = quizzes.find((q) => q._id === result.quiz);
    return {
      ...result,
      title: quiz?.title || result.title || "Quiz inconnu",
      passingScore: quiz?.passingScore || 50,
    };
  });

  // Filtrage selon la recherche texte et la date
  const filteredResults = userQuizResults.filter(({ title, date }) => {
    const matchTitle = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate = searchDate ? date.startsWith(searchDate) : true; 
    // date.startsWith car date est en ISO string (ex: "2025-06-30T..."), on compare juste yyyy-mm-dd
    return matchTitle && matchDate;
  });

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Mes Quiz passés</h1>

      {/* Barre de recherche */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher par titre de quiz"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow border rounded px-3 py-2"
          aria-label="Recherche par titre de quiz"
        />
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="border rounded px-3 py-2"
          aria-label="Filtrer par date"
        />
      </div>

      {filteredResults.length === 0 ? (
        <p>Aucun quiz trouvé avec ces critères.</p>
      ) : (
        filteredResults.map(({ _id, title, score, date, passingScore }) => (
          <Card key={_id} className="border border-gray-300 shadow-sm">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p>
                Score :{" "}
                <Badge variant={score >= passingScore ? "default" : "destructive"}>
                  {score}%
                </Badge>
              </p>
              <p className="text-sm text-gray-500">
                Date : {new Date(date).toLocaleDateString("fr-FR")}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
