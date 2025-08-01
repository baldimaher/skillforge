"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Pour un bouton de réinitialisation
import Head from "next/head";
import { Input } from "@/components/ui/input"; // Ajout d'un composant Input standardisé
import { toast } from "@/components/ui/use-toast"; // Pour des notifications utilisateur

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
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Pour la pagination
  const quizzesPerPage = 5; // Nombre de quiz par page

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          setUser(null);
          return;
        }
        const userObj: UserType = JSON.parse(userStr);
        setUser(userObj);

        const res = await fetch("/api/quiz", {
          headers: {
            authorization: userObj._id,
          },
          cache: "no-store", // Éviter le cache pour des données fraîches
        });

        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des quiz");
        }

        const data: QuizType[] = await res.json();
        setQuizzes(data);
      } catch (err) {
        setError("Impossible de récupérer les quiz. Veuillez réessayer plus tard.");
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement des quiz.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Réinitialiser la pagination lors d'un changement de recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchDate]);

  // Memoïser les résultats filtrés pour éviter des recalculs inutiles
  const filteredResults = useMemo(() => {
    if (!user?.quizzes) return [];

    const results = user.quizzes.map((result) => {
      const quiz = quizzes.find((q) => q._id === result.quiz);
      return {
        ...result,
        title: quiz?.title || result.title || "Quiz inconnu",
        passingScore: quiz?.passingScore || 50,
      };
    });

    return results.filter(({ title, date }) => {
      const matchTitle = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDate = searchDate ? date.startsWith(searchDate) : true;
      return matchTitle && matchDate;
    });
  }, [user, quizzes, searchTerm, searchDate]);

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / quizzesPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * quizzesPerPage,
    currentPage * quizzesPerPage
  );

  // Gestion du changement de page
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSearchDate("");
    setCurrentPage(1);
    toast({
      title: "Filtres réinitialisés",
      description: "Tous les filtres ont été réinitialisés.",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500 animate-pulse">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 mt-20">
        <p>{error}</p>
      </div>
    );
  }

  if (!user || !user.quizzes || user.quizzes.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-20">
        <p>Vous n'avez pas encore passé de quiz.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mes Quiz passés - InnovaSkilles</title>
        <meta
          name="description"
          content="Consultez vos résultats aux quiz passés sur InnovaSkilles."
        />
      </Head>

      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
          Mes Quiz passés
        </h1>

        {/* Barre de recherche */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Input
            type="text"
            placeholder="Rechercher par titre de quiz"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
            aria-label="Recherche par titre de quiz"
          />
          <Input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="w-full sm:w-auto"
            aria-label="Filtrer par date"
          />
          <Button variant="outline" onClick={resetFilters}>
            Réinitialiser
          </Button>
        </div>

        {filteredResults.length === 0 ? (
          <p className="text-center text-gray-500">Aucun quiz trouvé avec ces critères.</p>
        ) : (
          <>
            {paginatedResults.map(({ _id, title, score, date, passingScore }) => (
              <Card
                key={_id}
                className="border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p>
                    Score :{" "}
                    <Badge
                      variant={score >= passingScore ? "default" : "destructive"}
                      className="ml-2"
                    >
                      {score}%
                    </Badge>
                  </p>
                  <p className="text-sm text-gray-500">
                    Date : {new Date(date).toLocaleDateString("fr-FR")}
                  </p>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Précédent
                </Button>
                <span className="flex items-center text-gray-600">
                  Page {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}