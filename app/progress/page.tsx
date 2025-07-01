'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import React, { useEffect, useState } from 'react';

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies?: string[];
  status?: string;
  takenBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Quiz {
  quiz: string;
  score: number;
  date: string;
  title: string;
}

interface UserProgress {
  projectsTaken: Project[];
  quizzes: Quiz[];
}

interface QuizGroup {
  title: string;
  attempts: { score: number; date: string }[];
  trend: string;
  averageScore: number;
}

export default function UserProgressPage() {
  const [data, setData] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [quizGroups, setQuizGroups] = useState<QuizGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserId(JSON.parse(storedUser)._id);
    } else {
      setError('Utilisateur non connecté');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch(`/api/user-progress?userId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors de la récupération des données');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);

        // Explicitly type the accumulator
        const groupedQuizzes: { [key: string]: Quiz[] } = json.quizzes.reduce(
          (acc: { [key: string]: Quiz[] }, quiz: Quiz) => {
            acc[quiz.title] = acc[quiz.title] || [];
            acc[quiz.title].push(quiz);
            return acc;
          },
          {}
        );

        const quizGroups: QuizGroup[] = Object.entries(groupedQuizzes).map(([title, attempts]) => {
          // Ensure attempts is typed as Quiz[]
          const sortedAttempts = (attempts as Quiz[])
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(quiz => ({ score: quiz.score, date: quiz.date }));

          let trend = 'Stable';
          if (sortedAttempts.length > 1) {
            const latestScore = sortedAttempts[sortedAttempts.length - 1].score;
            const previousScore = sortedAttempts[sortedAttempts.length - 2].score;
            trend = latestScore > previousScore ? 'Progression' : latestScore < previousScore ? 'Régresse' : 'Stable';
          }

          const averageScore =
            sortedAttempts.length > 0
              ? sortedAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / sortedAttempts.length
              : 0;

          return { title, attempts: sortedAttempts, trend, averageScore };
        });

        setQuizGroups(quizGroups);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <motion.p
        className="text-lg font-semibold text-indigo-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Chargement...
      </motion.p>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <motion.p
        className="text-lg font-semibold text-red-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Erreur : {error}
      </motion.p>
    </div>
  );

  if (!data) return (
    <div className="flex justify-center items-center min-h-screen">
      <motion.p
        className="text-lg font-semibold text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Aucune donnée à afficher.
      </motion.p>
    </div>
  );
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-screen">
    
      {/* Projects Section */}
      <section className="mb-12">
        <motion.h1
          className="text-3xl font-bold text-indigo-700 mb-6 border-b-2 border-indigo-200 pb-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Projets pris en charge ({data.projectsTaken.length})
        </motion.h1>
        {data.projectsTaken.length === 0 ? (
          <motion.p
            className="text-center text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Aucun projet
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {data.projectsTaken.map(project => (
                <motion.article
                  key={project._id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  aria-labelledby={`project-title-${project._id}`}
                >
                  <h2 id={`project-title-${project._id}`} className="text-xl font-semibold text-indigo-600 mb-3">
                    {project.title}
                  </h2>
                  <p className="text-gray-700 mb-3">{project.description}</p>
                  <p className="text-sm">
                    <strong className="text-indigo-600">Technologies :</strong>{' '}
                    {project.technologies?.join(', ') || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <strong className="text-indigo-600">Statut :</strong> {project.status || 'Non défini'}
                  </p>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Quiz Progress Summary */}
      <section className="mb-12">
        <motion.h1
          className="text-3xl font-bold text-indigo-700 mb-6 border-b-2 border-indigo-200 pb-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Résumé des progrès
        </motion.h1>
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-indigo-600 mb-4">Tendances globales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizGroups.map(group => (
              <div key={group.title} className="p-4 bg-gray-100 rounded-lg">
                <h3 className="text-lg font-medium text-indigo-600">{group.title}</h3>
                <p className="text-sm text-gray-700">Score moyen : {group.averageScore.toFixed(1)}%</p>
                <p
                  className={`text-sm font-semibold ${
                    group.trend === 'Progression'
                      ? 'text-green-600'
                      : group.trend === 'Régresse'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  Tendance : {group.trend}
                </p>
                <button
                  onClick={() => setSelectedGroup(group.title)}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 underline"
                >
                  Voir le graphique
                </button>
              </div>
            ))}
          </div>
          {selectedGroup && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-indigo-600 mb-4">
                Graphique des scores : {selectedGroup}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={quizGroups
                      .find(group => group.title === selectedGroup)!
                      .attempts.map((attempt, index) => ({
                        name: `Essai ${index + 1}`,
                        score: attempt.score,
                      }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Quizzes Section */}
      <section className="mb-12">
        <motion.h1
          className="text-3xl font-bold text-indigo-700 mb-6 border-b-2 border-indigo-200 pb-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Quizzes ({quizGroups.length})
        </motion.h1>
        {quizGroups.length === 0 ? (
          <motion.p
            className="text-center text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Aucun quiz
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {quizGroups.map((group, i) => (
                <motion.article
                  key={i}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  aria-labelledby={`quiz-title-${i}`}
                >
                  <h2 id={`quiz-title-${i}`} className="text-xl font-semibold text-indigo-600 mb-3">
                    {group.title}
                  </h2>
                  {group.attempts.map((attempt, j) => (
                    <div key={j} className="mb-4">
                      <p className="text-sm text-gray-700">
                        <strong className="text-indigo-600">Date :</strong>{' '}
                        {new Date(attempt.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <div
                        className="w-full bg-gray-200 rounded-full h-4 mb-2"
                        role="progressbar"
                        aria-valuenow={attempt.score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <motion.div
                          className="bg-emerald-500 h-4 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${attempt.score}%` }}
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                        />
                      </div>
                      <p className="text-right text-sm font-semibold text-emerald-600">{attempt.score}%</p>
                    </div>
                  ))}
                  <p
                    className={`text-sm font-semibold ${
                      group.trend === 'Progression'
                        ? 'text-green-600'
                        : group.trend === 'Régresse'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    Tendance : {group.trend}
                  </p>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </main>
  );
}