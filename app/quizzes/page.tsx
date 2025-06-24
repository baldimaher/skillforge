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
  lastAttemptDate?: string;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [quizTimeLeft, setQuizTimeLeft] = useState<Record<string, string>>({});

  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
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

  const getDifficultyColor = (difficulty: string) => {
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

  const getTimeUntilRetake = (lastAttemptDate: string): string => {
    const lastAttempt = new Date(lastAttemptDate);
    const nextAvailable = new Date(lastAttempt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 jours après
    const now = new Date();
    const diffMs = nextAvailable.getTime() - now.getTime();

    if (diffMs <= 0) return "Vous pouvez repasser maintenant !";

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let remaining = "";
    if (days > 0) remaining += `${days} jour${days > 1 ? "s" : ""}`;
    if (hours > 0) remaining += `${remaining ? ", " : ""}${hours} heure${hours > 1 ? "s" : ""}`;

    return `Repassable dans ${remaining}`;
  };

  const canRetakeQuiz = (quiz: QuizType) => {
    if (!quiz.lastAttemptDate) return true;
    const lastAttempt = new Date(quiz.lastAttemptDate);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return lastAttempt <= sevenDaysAgo;
  };

  useEffect(() => {
    const updateTimeLeft = () => {
      const newTimes: Record<string, string> = {};
      quizzes.forEach((quiz) => {
        if (quiz.completed && !canRetakeQuiz(quiz) && quiz.lastAttemptDate) {
          newTimes[quiz._id] = getTimeUntilRetake(quiz.lastAttemptDate);
        }
      });
      setQuizTimeLeft(newTimes);
    };

    updateTimeLeft(); // Appel initial
    const intervalId = setInterval(updateTimeLeft, 60 * 1000); // Mise à jour toutes les minutes

    return () => clearInterval(intervalId);
  }, [quizzes]);

  const startQuiz = useCallback(
    (quiz: QuizType) => {
      if (!canRetakeQuiz(quiz)) {
        setMessage(
          quiz.lastAttemptDate
            ? getTimeUntilRetake(quiz.lastAttemptDate)
            : "Vous devez attendre 7 jours avant de repasser ce quiz."
        );
        return;
      }
      if (quiz.questions?.length > 0) {
        setActiveQuiz(quiz);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnswers(Array(quiz.questions.length).fill(null));
        setScore(null);
        setError(null);
        setMessage(null);
      } else {
        setError("Ce quiz n'a pas de questions valides.");
      }
    },
    []
  );

  const calculateScore = useCallback((answers: (number | null)[], quiz: QuizType) => {
    const correctCount = quiz.questions.reduce(
      (acc, q, idx) => acc + (answers[idx] === q.correctAnswer ? 1 : 0),
      0
    );
    return Math.round((correctCount / quiz.questions.length) * 100);
  }, []);

  const saveQuizScore = useCallback(
    async (quizId: string, score: number, answers: (number | null)[]) => {
      setIsSaving(true);
      setMessage(null);
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          setMessage("Vous devez être connecté pour sauvegarder votre score.");
          return;
        }
        const userObj = JSON.parse(userStr);
        const userId = userObj._id || userObj.id || localStorage.getItem("userId");

        if (!userId || userId === "undefined") {
          setMessage("Identifiant utilisateur introuvable.");
          return;
        }

        const res = await fetch(`/api/quiz/${quizId}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            score,
            answers,
            title: activeQuiz?.title,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          if (res.status === 403) {
            setMessage(errorData.message || "Vous avez déjà effectué ce quiz récemment.");
            return;
          }
          throw new Error(errorData.message || "Erreur serveur");
        }

        setMessage("Score enregistré avec succès !");
        await fetchQuizzes();
      } catch (err) {
        console.error("Erreur lors de la sauvegarde du score:", err);
        setMessage("Erreur lors de la sauvegarde du score.");
      } finally {
        setIsSaving(false);
      }
    },
    [fetchQuizzes, activeQuiz?.title]
  );

  const handleNextQuestion = useCallback(async () => {
    if (!activeQuiz) return;
    if (selectedAnswer === null) {
      setMessage("Veuillez sélectionner une réponse avant de continuer.");
      return;
    }

    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex((idx) => idx + 1);
      setSelectedAnswer(updatedAnswers[currentQuestionIndex + 1]);
      setMessage(null);
    } else {
      const finalScore = calculateScore(updatedAnswers, activeQuiz);
      setScore(finalScore);
      await saveQuizScore(activeQuiz._id, finalScore, updatedAnswers);
    }
  }, [activeQuiz, answers, calculateScore, currentQuestionIndex, saveQuizScore, selectedAnswer]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((idx) => idx - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
      setMessage(null);
    }
  }, [answers, currentQuestionIndex]);

  if (isLoading)
    return <div className="text-center">Chargement des quiz...</div>;

  if (error)
    return (
      <div className="text-center text-red-600">
        Erreur : {error}
      </div>
    );

  if (activeQuiz && activeQuiz.questions?.[currentQuestionIndex] && score === null) {
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
            disabled={isSaving}
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
              value={
                selectedAnswer !== null
                  ? activeQuiz.questions[currentQuestionIndex].options[selectedAnswer]
                  : ""
              }
              onValueChange={(val) => {
                const idx = activeQuiz.questions[currentQuestionIndex].options.indexOf(val);
                setSelectedAnswer(idx !== -1 ? idx : null);
                setMessage(null);
              }}
              className="space-y-2"
            >
              {currentQuestion.options.map((option, idx) => (
                <div
                  key={idx}
                  className={`flex items-center p-3 rounded-lg border transition-colors ${
                    selectedAnswer === idx
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
            {message && <p className="text-red-600 mt-2">{message}</p>}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0 || isSaving}
                className="rounded-full px-6"
              >
                Précédent
              </Button>
              <Button
                disabled={selectedAnswer === null || isSaving}
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
          />
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
            {score >= activeQuiz.passingScore
              ? "Bravo, vous avez réussi !"
              : "Dommage, essayez encore !"}
          </span>
        </div>
        <Button
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8"
          onClick={() => setActiveQuiz(null)}
          disabled={isSaving}
        >
          Retour à la liste des quiz
        </Button>
      </div>
    );
  }

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
                    <Badge className={getDifficultyColor(quiz.difficulty)}>
                      {quiz.difficulty || "Inconnu"}
                    </Badge>
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

                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      variant={quiz.completed ? "outline" : "default"}
                      onClick={() => startQuiz(quiz)}
                      disabled={isSaving || (quiz.completed && !canRetakeQuiz(quiz))}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {quiz.completed
                        ? canRetakeQuiz(quiz)
                          ? "Reprendre le quiz"
                          : "Quiz bloqué"
                        : "Démarrer le quiz"}
                    </Button>
                    {quiz.completed && !canRetakeQuiz(quiz) && quizTimeLeft[quiz._id] && (
                      <p className="text-sm text-red-600 text-center">{quizTimeLeft[quiz._id]}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-slate-600">Aucun quiz disponible.</p>
        )}
      </div>
      {message && <p className="text-red-600 text-center mt-4">{message}</p>}
    </div>
  );
}
