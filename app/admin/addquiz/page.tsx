"use client";

import { useState } from "react";

export default function AddQuizPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("moyen");
  const [timeLimit, setTimeLimit] = useState(20);
  const [passingScore, setPassingScore] = useState(70);
  const [category, setCategory] = useState("Développement web");

  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    if (field === "question") {
      updatedQuestions[index].question = value;
    } else if (field.startsWith("option")) {
      const optionIndex = parseInt(field.replace("option", ""));
      updatedQuestions[index].options[optionIndex] = value;
    } else if (field === "correctAnswer") {
      updatedQuestions[index].correctAnswer = parseInt(value);
    }
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const quiz = {
      title,
      description,
      difficulty,
      timeLimit,
      passingScore,
      category,
      questions,
    };

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Quiz ajouté !");
        // Réinitialiser
        setTitle("");
        setDescription("");
        setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
      } else {
        alert(data.message || "Erreur lors de l'ajout.");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-6">
      <h1 className="text-2xl font-bold">Ajouter un Quiz</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" className="w-full border p-2 rounded" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full border p-2 rounded" required />
        <div className="flex gap-4">
          <input value={difficulty} onChange={(e) => setDifficulty(e.target.value)} placeholder="Difficulté" className="w-1/3 border p-2 rounded" required />
          <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value))} placeholder="Durée (min)" className="w-1/3 border p-2 rounded" required />
          <input type="number" value={passingScore} onChange={(e) => setPassingScore(parseInt(e.target.value))} placeholder="Score requis" className="w-1/3 border p-2 rounded" required />
        </div>
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Catégorie" className="w-full border p-2 rounded" required />

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Questions</h2>
          {questions.map((q, idx) => (
            <div key={idx} className="border p-4 rounded space-y-2">
              <input
                type="text"
                value={q.question}
                onChange={(e) => handleQuestionChange(idx, "question", e.target.value)}
                placeholder={`Question ${idx + 1}`}
                className="w-full border p-2 rounded"
                required
              />
              {q.options.map((opt, optIdx) => (
                <input
                  key={optIdx}
                  type="text"
                  value={opt}
                  onChange={(e) => handleQuestionChange(idx, `option${optIdx}`, e.target.value)}
                  placeholder={`Option ${optIdx + 1}`}
                  className="w-full border p-2 rounded"
                  required
                />
              ))}
              <select
                value={q.correctAnswer}
                onChange={(e) => handleQuestionChange(idx, "correctAnswer", e.target.value)}
                className="w-full border p-2 rounded"
              >
                {q.options.map((_, i) => (
                  <option key={i} value={i}>
                    Bonne réponse: Option {i + 1}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="bg-gray-100 border px-4 py-2 rounded">
            ➕Ajouter une question
          </button>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
          ✅ Enregistrer le quiz
        </button>
      </form>
    </div>
  );
}
