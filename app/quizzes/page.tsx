"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Clock, Folder } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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
  userAttempts?: { userId: string; lastAttemptDate: string; score?: number }[];
}

interface UserType {
  _id: string;
  firstName: string;
  lastName: string;
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
  const [timer, setTimer] = useState<number | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateReady, setCertificateReady] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  // Fetch quizzes from API
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
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    fetchQuizzes();
    // Add message listener for PDF download request
    const handleMessage = (event: MessageEvent) => {
      console.log("Message received:", event.data, "from origin:", event.origin);
      if (event.data === "downloadCertificate") {
        console.log("Triggering downloadCertificate");
        downloadCertificate();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [fetchQuizzes]);

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "facile":
        return "bg-green-100 text-green-700";
      case "moyen":
        return "bg-yellow-100 text-yellow-700";
      case "difficile":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Calculate time until quiz can be retaken
  const getTimeUntilRetake = (lastAttemptDate: string): string => {
    const lastAttempt = new Date(lastAttemptDate);
    const nextAvailable = new Date(lastAttempt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = nextAvailable.getTime() - now.getTime();

    if (diffMs <= 0) return "Disponible maintenant !";

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `Repassable dans ${days} jour${days > 1 ? "s" : ""} et ${hours} heure${hours > 1 ? "s" : ""}`;
  };

  // Check if user can retake the quiz
  const canRetakeQuiz = (quiz: QuizType) => {
    if (!user || !quiz.userAttempts) return true;
    const userAttempt = quiz.userAttempts.find((attempt) => attempt.userId === user._id);
    if (!userAttempt || !userAttempt.lastAttemptDate) return true;

    const lastAttempt = new Date(userAttempt.lastAttemptDate);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return lastAttempt <= sevenDaysAgo;
  };

  // Update time left for retaking quizzes
  useEffect(() => {
    const updateTimeLeft = () => {
      const newTimes: Record<string, string> = {};
      quizzes.forEach((quiz) => {
        if (!canRetakeQuiz(quiz) && quiz.userAttempts) {
          const userAttempt = quiz.userAttempts.find((attempt) => attempt.userId === user?._id);
          if (userAttempt?.lastAttemptDate) {
            console.log(`Quiz ${quiz.title}, lastAttemptDate:`, userAttempt.lastAttemptDate);
            newTimes[quiz._id] = getTimeUntilRetake(userAttempt.lastAttemptDate);
          }
        }
      });
      setQuizTimeLeft(newTimes);
    };
    updateTimeLeft();
    const intervalId = setInterval(updateTimeLeft, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [quizzes, user]);

  // Start a quiz
  const startQuiz = useCallback(
    (quiz: QuizType) => {
      if (!user || !canRetakeQuiz(quiz)) {
        setMessage(
          !user
            ? "Vous devez être connecté pour passer un quiz."
            : quiz.userAttempts && !canRetakeQuiz(quiz)
            ? getTimeUntilRetake(
                quiz.userAttempts.find((attempt) => attempt.userId === user._id)?.lastAttemptDate || ""
              )
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
        setTimer(quiz.timeLimit * 60);
        setShowCertificate(false);
        setCertificateReady(false);
      } else {
        setMessage("Ce quiz n'a pas de questions valides.");
      }
    },
    [user]
  );

  // Timer management
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer !== null && timer > 0 && activeQuiz && score === null) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev && prev <= 1) {
            const finalScore = calculateScore(answers, activeQuiz);
            setScore(finalScore);
            saveQuizScore(activeQuiz._id, finalScore, answers);
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, activeQuiz, answers, score]);

  // Format remaining time
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // Calculate score
  const calculateScore = useCallback((answers: (number | null)[], quiz: QuizType) => {
    const correctCount = quiz.questions.reduce(
      (acc, q, idx) => acc + (answers[idx] === q.correctAnswer ? 1 : 0),
      0
    );
    return Math.round((correctCount / quiz.questions.length) * 100);
  }, []);

  // Save quiz score
  const saveQuizScore = useCallback(
    async (quizId: string, finalScore: number, answers: (number | null)[]) => {
      setIsSaving(true);
      setMessage(null);

      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          setMessage("Vous devez être connecté pour sauvegarder votre score.");
          setIsSaving(false);
          return;
        }

        const userObj = JSON.parse(userStr);
        const userId = userObj._id;

        if (!userId || finalScore === null || finalScore === undefined || !activeQuiz?.title) {
          console.error("Données manquantes pour sauvegarder le score :", { userId, finalScore, title: activeQuiz?.title });
          setMessage("Impossible de sauvegarder : données incomplètes.");
          setIsSaving(false);
          return;
        }

        const res = await fetch(`/api/quiz/${quizId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            score: finalScore,
            answers,
            title: activeQuiz.title,
            lastAttemptDate: new Date().toISOString(),
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          if (res.status === 403) {
            setMessage(errorData.message || "Vous avez déjà effectué ce quiz récemment.");
            setIsSaving(false);
            return;
          }
          throw new Error(errorData.message || "Erreur serveur");
        }

        if (finalScore >= (activeQuiz?.passingScore ?? 0)) {
          await fetch("/api/certificates/new", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              quizId,
              quizTitle: activeQuiz?.title,
              score: finalScore,
              date: new Date(),
            }),
          });
          setCertificateReady(true);
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
    [fetchQuizzes, activeQuiz?.title, activeQuiz?.passingScore]
  );

  // Go to next question
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

  // Go to previous question
  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((idx) => idx - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
      setMessage(null);
    }
  }, [answers, currentQuestionIndex]);

  // Generate and download certificate as PDF
  const downloadCertificate = async () => {
    console.log("Starting downloadCertificate", { activeQuiz, score });
    const userStr = localStorage.getItem("user");
    if (!userStr || !activeQuiz || score === null) {
      console.error("Download aborted: Missing user, activeQuiz, or score", { userStr, activeQuiz, score });
      return;
    }

    const certificateElement = document.createElement('div');
    certificateElement.innerHTML = generateCertificate().props.dangerouslySetInnerHTML.__html;
    document.body.appendChild(certificateElement);

    const canvas = await html2canvas(certificateElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    console.log("Saving PDF:", `${activeQuiz.title}_certificate.pdf`);
    doc.save(`${activeQuiz.title}_certificate.pdf`);
    document.body.removeChild(certificateElement);
  };

  // Open certificate in new tab
  const openCertificateInNewTab = () => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : { firstName: "Utilisateur", lastName: "" };
    const date = new Date().toLocaleDateString("fr-FR");

    const certificateHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificat de Réussite - ${activeQuiz?.title}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .certificate {
            background: white;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 600px;
            width: 100%;
            border: 8px solid #4f46e5;
            position: relative;
            overflow: hidden;
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(79, 70, 229, 0.1), transparent);
            transform: rotate(45deg);
            animation: shine 3s infinite;
          }
          @keyframes shine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }
          .certificate-content {
            position: relative;
            z-index: 2;
          }
          h1 {
            color: #4f46e5;
            font-size: 2.5em;
            margin-bottom: 30px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          .recipient-name {
            font-size: 2em;
            color: #4f46e5;
            font-weight: bold;
            margin: 20px 0;
            text-decoration: underline;
          }
          .quiz-title {
            font-size: 1.5em;
            color: #6366f1;
            font-weight: 600;
            margin: 20px 0;
            font-style: italic;
          }
          .score {
            font-size: 1.8em;
            color: #059669;
            font-weight: bold;
            margin: 20px 0;
          }
          .date {
            color: #6b7280;
            font-size: 1.1em;
            margin: 20px 0;
          }
          .decorative-border {
            border: 3px solid #4f46e5;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
          }
          .buttons {
            margin-top: 40px;
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
          }
          button {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          button:hover {
            background: #4338ca;
            transform: translateY(-2px);
          }
          .print-button {
            background: #059669;
          }
          .print-button:hover {
            background: #047857;
          }
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .certificate {
              box-shadow: none;
              border: 2px solid #4f46e5;
            }
            .buttons {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="certificate-content">
            <h1>🏆 Certificat de Réussite 🏆</h1>
            <div class="decorative-border">
              <p style="font-size: 1.2em; color: #6b7280; margin: 0;">Ceci certifie que</p>
              <div class="recipient-name">${user.firstName} ${user.lastName}</div>
              <p style="font-size: 1.2em; color: #6b7280; margin: 0;">a réussi avec succès le quiz</p>
              <div class="quiz-title">"${activeQuiz?.title}"</div>
              <div class="score">Score obtenu: ${score}%</div>
              <div class="date">Délivré le ${date}</div>
            </div>
            <div class="buttons">
              <button class="print-button" onclick="window.print()">
                🖨️ Imprimer le certificat
              </button>
              <button onclick="window.postMessage('downloadCertificate', '*')">
                📄 Télécharger en PDF
              </button>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(certificateHtml);
      newWindow.document.close();
    }
  };

  // Render certificate
  const generateCertificate = () => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : { firstName: "Utilisateur", lastName: "" };
    const date = new Date().toLocaleDateString("fr-FR");

    return (
      <div className="p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto text-center mt-8 border border-indigo-200" dangerouslySetInnerHTML={{
        __html: `
          <h2 style="text-3xl font-bold mb-6 text-indigo-800">Certificat de Réussite</h2>
          <p style="text-gray-600">Ceci certifie que</p>
          <p style="text-2xl font-semibold my-4 text-indigo-700">${user.firstName} ${user.lastName}</p>
          <p style="text-gray-600">a réussi le quiz</p>
          <p style="text-xl font-medium text-indigo-600 my-4">${activeQuiz?.title}</p>
          <p style="text-gray-600">avec un score de ${score}%</p>
          <p style="my-4 text-gray-500">Date : ${date}</p>
          <div style="flex gap-4 justify-center">
            <button style="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg" onclick="window.print()">Imprimer le certificat</button>
            <button style="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg" onclick="downloadCertificate()">Télécharger en PDF</button>
          </div>
        `
      }} />
    );
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-600 animate-pulse">
        Chargement des quiz...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-medium bg-red-50 p-4 rounded-lg">
        Erreur : {error}
      </div>
    );
  }

  if (activeQuiz && activeQuiz.questions?.[currentQuestionIndex] && score === null) {
    const currentQuestion = activeQuiz.questions[currentQuestionIndex];
    return (
      <div className="max-w-2xl mx-auto space-y-8 p-6 bg-white rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-800 mb-1">{activeQuiz.title}</h1>
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} / {activeQuiz.questions.length}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-lg">
              Temps restant: {timer !== null ? formatTime(timer) : "00:00"}
            </span>
            <Button
              variant="outline"
              className="border-red-400 text-red-600 hover:bg-red-50"
              onClick={() => setActiveQuiz(null)}
              disabled={isSaving}
            >
              Quitter le quiz
            </Button>
          </div>
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
                  className={`flex items-center p-3 rounded-lg border transition-all duration-200 ${
                    selectedAnswer === idx
                      ? "border-indigo-500 bg-indigo-50 scale-105"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem
                    value={option}
                    id={`option-${idx}`}
                    aria-label={`Option ${idx + 1}: ${option}`}
                  />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer text-lg">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {message && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                {message}
              </div>
            )}
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
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-2 rounded-full transition-all duration-500"
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
        <div className="flex flex-col items-center space-y-4">
          <span className="text-5xl font-extrabold text-indigo-600">{score}%</span>
          {score >= activeQuiz.passingScore ? (
            <>
              <div className="flex items-center gap-2 justify-center text-green-600 font-semibold text-xl">
                <CheckCircle className="w-8 h-8" />
                <p>Félicitations, vous avez réussi le quiz !</p>
              </div>
              {certificateReady && (
                <div className="flex gap-4">
                  <Button
                    onClick={openCertificateInNewTab}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow"
                  >
                    Voir certificat
                  </Button>
                  <Button
                    onClick={downloadCertificate}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow"
                  >
                    Télécharger certificat
                  </Button>
                </div>
              )}
              {showCertificate && generateCertificate()}
            </>
          ) : (
            <p className="text-red-600 text-lg font-semibold">
              Désolé, vous n'avez pas atteint le score requis (${activeQuiz.passingScore}%).
            </p>
          )}
          {message && (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg text-center">
              {message}
            </div>
          )}
        </div>
        <Button onClick={() => setActiveQuiz(null)} className="mt-8" variant="outline">
          Retour à la liste des quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold text-indigo-700 text-center mb-10">Explorez Nos Quiz</h1>

      {quizzes.length === 0 && !isLoading && (
        <p className="text-center text-gray-500">Aucun quiz disponible pour le moment.</p>
      )}

      {message && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card
            key={quiz._id}
            onClick={() => startQuiz(quiz)}
            className={`
              relative rounded-xl border border-indigo-200
              bg-gradient-to-br from-indigo-50 to-white
              shadow-md hover:shadow-lg hover:-translate-y-1
              transition-all duration-300 overflow-hidden
              ${!canRetakeQuiz(quiz) ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"}
            `}
          >
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-semibold text-indigo-900">{quiz.title}</CardTitle>
              <CardDescription className="text-gray-600 mt-2">{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-indigo-500" />
                <span className="text-sm text-gray-700">{quiz.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  className={`px-3 py-1 rounded-full font-semibold ${getDifficultyColor(quiz.difficulty)}`}
                >
                  {quiz.difficulty}
                </Badge>
                <Badge
                  className={`px-3 py-1 rounded-full font-semibold ${
                    quiz.userAttempts?.some((attempt) => attempt.userId === user?._id)
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {quiz.userAttempts?.some((attempt) => attempt.userId === user?._id) ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Terminé
                    </span>
                  ) : (
                    "Non terminé"
                  )}
                </Badge>
              </div>
              {quiz.userAttempts?.some((attempt) => attempt.userId === user?._id) && (
                <div className="text-sm text-gray-700">
                  Votre score :{" "}
                  {quiz.userAttempts.find((attempt) => attempt.userId === user?._id)?.score ?? "N/A"}%
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                <span className="text-sm text-gray-700">{quiz.timeLimit} minutes</span>
              </div>
              {!canRetakeQuiz(quiz) && quiz.userAttempts && (
                <div className="flex items-center gap-2 text-sm text-red-600 font-semibold bg-red-50 p-2 rounded-lg">
                  <Clock className="w-5 h-5" />
                  {quizTimeLeft[quiz._id] || "Chargement..."}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}