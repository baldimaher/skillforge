"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Play } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface QuizType {
  _id: string;
  title: string;
  description: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  timeLimit: number;
  passingScore: number;
  category: string;
  difficulty: "facile" | "moyen" | "difficile";
  completed?: boolean;
  score?: number;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch quizzes from API
  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/quiz");
      if (!response.ok) throw new Error("Erreur lors de la récupération des quiz");
      const data: QuizType[] = await response.json();
      setQuizzes(data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue lors de la récupération des quiz");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Color classes by difficulty
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "facile":
        return "bg-green-100 text-green-800 border-green-200";
      case "moyen":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "difficile":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Start quiz
  const startQuiz = useCallback((quiz: QuizType) => {
    if (quiz.questions?.length > 0) {
      setActiveQuiz(quiz);
      setCurrentQuestionIndex(0);
      setSelectedAnswer("");
      setUserAnswers([]);
      setScore(null);
      setError(null);
    } else {
      setError("Ce quiz n'a pas de questions valides.");
    }
  }, []);

  // Calculate score in %
  const calculateScore = useCallback((answers: number[], quiz: QuizType) => {
    const correct = quiz.questions.reduce(
      (acc, q, idx) => acc + (answers[idx] === q.correctAnswer ? 1 : 0),
      0
    );
    return Math.round((correct / quiz.questions.length) * 100);
  }, []);

  // Save score + answers to backend
  const saveQuizScore = useCallback(
    async (quizId: string, score: number, answers: number[]) => {
      setIsSaving(true);
      try {
       const user = localStorage.getItem("user");
          if (!user) {
            console.error("Utilisateur non connecté");
            return;
          }
          const userId = JSON.parse(user)._id;


        const res = await fetch(`/api/quiz/${quizId}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score,
            userId,
            answers, // Envoie les réponses choisies aussi
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Erreur serveur");
        }

        await fetchQuizzes(); // Rafraîchir la liste des quizzes (pour mettre à jour les scores)
      } catch (err) {
        console.error("Erreur lors de la sauvegarde du score:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [fetchQuizzes]
  );

  // Gestion du bouton "Suivant"
  const handleNextQuestion = useCallback(async () => {
    if (!activeQuiz) return;
    const currentQ = activeQuiz.questions[currentQuestionIndex];
    const selectedIndex = currentQ.options.findIndex((opt) => opt === selectedAnswer);
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = selectedIndex;
    setUserAnswers(updatedAnswers);

    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex((idx) => idx + 1);
      setSelectedAnswer(
        typeof updatedAnswers[currentQuestionIndex + 1] === "number"
          ? activeQuiz.questions[currentQuestionIndex + 1].options[updatedAnswers[currentQuestionIndex + 1]]
          : ""
      );
    } else {
      const result = calculateScore(updatedAnswers, activeQuiz);
      setScore(result);
      await saveQuizScore(activeQuiz._id, result, updatedAnswers);
    }
  }, [
    activeQuiz,
    currentQuestionIndex,
    selectedAnswer,
    userAnswers,
    calculateScore,
    saveQuizScore,
  ]);

  // Gestion du bouton "Précédent"
  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((idx) => idx - 1);
      if (
        typeof userAnswers[currentQuestionIndex - 1] === "number" &&
        activeQuiz
      ) {
        setSelectedAnswer(
          activeQuiz.questions[currentQuestionIndex - 1].options[
            userAnswers[currentQuestionIndex - 1]
          ]
        );
      } else {
        setSelectedAnswer("");
      }
    }
  }, [currentQuestionIndex, userAnswers, activeQuiz]);

  // UI

  if (isLoading) return <div className="text-center">Chargement des quiz...</div>;
  if (error) return <div className="text-center text-red-600">Erreur : {error}</div>;

  if (
    activeQuiz &&
    activeQuiz.questions?.[currentQuestionIndex] &&
    score === null
  ) {
    const currentQuestion = activeQuiz.questions[currentQuestionIndex];
    return (
      <div className="max-w-2xl mx-auto space-y-8 p-6 bg-white rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700 mb-1">{activeQuiz.title}</h1>
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} / {activeQuiz.questions.length}
            </span>
          </div>
          <Button
            variant="outline"
            className="border-red-400 text-red-600 hover:bg-red-50"
            onClick={() => setActiveQuiz(null)}
          >
            Quitter le quiz
          </Button>
        </div>

        <Card className="border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-xl text-indigo-900">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={selectedAnswer}
              onValueChange={setSelectedAnswer}
              className="space-y-2"
            >
              {currentQuestion.options.map((option, idx) => (
                <div
                  key={idx}
                  className={`flex items-center p-3 rounded-lg border transition-colors ${
                    selectedAnswer === option
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer text-lg">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="rounded-full px-6"
              >
                Précédent
              </Button>
              <Button
                disabled={!selectedAnswer || isSaving}
                onClick={handleNextQuestion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 shadow"
              >
                {currentQuestionIndex === activeQuiz.questions.length - 1 ? "Terminer" : "Suivant"}
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    );
  }

  if (activeQuiz && score !== null) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-green-700">Quiz terminé !</h1>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-5xl font-extrabold text-indigo-600">{score}%</span>
          <span className="text-lg text-gray-600">
            {score >= activeQuiz.passingScore ? "Bravo, vous avez réussi !" : "Dommage, essayez encore !"}
          </span>
        </div>
        <Button
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8"
          onClick={() => setActiveQuiz(null)}
        >
          Retour à la liste des quiz
        </Button>
      </div>
    );
  }

  // Affichage liste des quizzes
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quizzes</h1>
        <p className="text-slate-600 mt-2">Testez vos connaissances et suivez votre progression</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.length > 0 ? (
          quizzes.map((quiz: QuizType) => (
            <Card key={quiz._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{quiz.title || "Quiz sans titre"}</CardTitle>
                    <CardDescription>{quiz.description || "Aucune description"}</CardDescription>
                  </div>
                  {quiz.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty || "Inconnu"}</Badge>
                    {quiz.completed && (
                      <span className="text-sm font-medium text-green-600">
                        Score: {(quiz.score ?? quiz.passingScore) || 0}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>{quiz.questions?.length || 0} questions</span>
                    <span>⏱️ {quiz.timeLimit || 0} min</span>
                  </div>

                  <Button
                    className="w-full"
                    variant={quiz.completed ? "outline" : "default"}
                    onClick={() => startQuiz(quiz)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {quiz.completed ? "Reprendre le quiz" : "Démarrer le quiz"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-slate-600">Aucun quiz disponible.</p>
        )}
      </div>
    </div>
  );
}
