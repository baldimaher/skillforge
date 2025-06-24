'use client';

import { useEffect, useState } from 'react';

type Quiz = {
  title: string;
  // tu peux ajouter description, category, etc.
};

export default function DashboardPage() {
  const [quizTitle, setQuizTitle] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch('/api/quiz'); // Remplace par ton vrai endpoint
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setQuizTitle(data[0].title); // Prend le premier quiz de la liste
        }
      } catch (error) {
        console.error('Erreur lors du chargement du quiz', error);
      }
    };

    fetchQuiz();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back to SkillForge</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ... les 4 blocs chiffrés restent identiques ... */}
        {/* pas modifiés ici pour clarté */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-slate-600">Completed React Todo App</p>
              <span className="text-xs text-slate-400 ml-auto">2h ago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-slate-600">Started Node.js API project</p>
              <span className="text-xs text-slate-400 ml-auto">1d ago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm text-slate-600">
                Quiz complété - {quizTitle || 'chargement...'}
              </p>
              <span className="text-xs text-slate-400 ml-auto">3d ago</span>
            </div>
          </div>
        </div>

        {/* Actions rapides inchangées */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {/* ... */}
          </div>
        </div>
      </div>
    </div>
  );
}
