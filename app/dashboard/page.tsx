export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back to SkillForge</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Projects</p>
              <p className="text-3xl font-bold text-slate-900">12</p>
            </div>
            <div className="text-2xl">🚀</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">8</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">3</p>
            </div>
            <div className="text-2xl">⏳</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Quiz Score</p>
              <p className="text-3xl font-bold text-purple-600">85%</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>
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
              <p className="text-sm text-slate-600">Quiz completed - JavaScript basics</p>
              <span className="text-xs text-slate-400 ml-auto">3d ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg">📚</span>
                <div>
                  <p className="font-medium text-slate-900">Browse Projects</p>
                  <p className="text-sm text-slate-600">Discover new challenges</p>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg">📝</span>
                <div>
                  <p className="font-medium text-slate-900">Take Quiz</p>
                  <p className="text-sm text-slate-600">Test your knowledge</p>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg">📈</span>
                <div>
                  <p className="font-medium text-slate-900">View Progress</p>
                  <p className="text-sm text-slate-600">Track your learning</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}