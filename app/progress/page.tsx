import { Award, BookOpen, Calendar, Code2, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const skillProgress = [
  { name: "JavaScript Fundamentals", progress: 85, level: "Advanced", color: "bg-yellow-500" },
  { name: "React Development", progress: 72, level: "Intermediate", color: "bg-blue-500" },
  { name: "Node.js & Backend", progress: 45, level: "Beginner", color: "bg-green-500" },
  { name: "Database Design", progress: 30, level: "Beginner", color: "bg-purple-500" },
  { name: "TypeScript", progress: 60, level: "Intermediate", color: "bg-indigo-500" },
  { name: "Testing & QA", progress: 25, level: "Beginner", color: "bg-red-500" },
]

const achievements = [
  { title: "First Steps", description: "Completed your first quiz", icon: "🎯", earned: true },
  { title: "Project Builder", description: "Finished 5 projects", icon: "🏗️", earned: true },
  { title: "Quiz Master", description: "Scored 90%+ on 10 quizzes", icon: "🧠", earned: true },
  { title: "Streak Keeper", description: "7-day learning streak", icon: "🔥", earned: false },
  { title: "Code Warrior", description: "Completed advanced project", icon: "⚔️", earned: false },
  { title: "Knowledge Seeker", description: "Completed 50 quizzes", icon: "📚", earned: false },
]

const recentActivity = [
  { type: "quiz", title: "React Hooks Deep Dive", score: 88, date: "2 hours ago" },
  { type: "project", title: "Todo App with React", completed: true, date: "1 day ago" },
  { type: "quiz", title: "JavaScript ES6 Features", score: 92, date: "2 days ago" },
  { type: "project", title: "REST API with Express", completed: false, date: "3 days ago" },
]

export default function ProgressPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Your Progress</h1>
        <p className="text-slate-600 mt-2">Track your learning journey and achievements</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450</div>
            <p className="text-xs text-muted-foreground">+180 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Intermediate</div>
            <p className="text-xs text-muted-foreground">750 XP to Advanced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 days</div>
            <p className="text-xs text-muted-foreground">Personal best: 18 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/6</div>
            <p className="text-xs text-muted-foreground">Badges earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Skill Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Progress</CardTitle>
          <CardDescription>Your progress across different technologies and concepts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {skillProgress.map((skill) => (
            <div key={skill.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${skill.color}`} />
                  <span className="font-medium">{skill.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {skill.level}
                  </Badge>
                </div>
                <span className="text-sm font-medium">{skill.progress}%</span>
              </div>
              <Progress value={skill.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Badges you've earned on your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    achievement.earned ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-slate-600">{achievement.description}</p>
                  </div>
                  {achievement.earned && <Badge className="bg-green-100 text-green-800 border-green-200">Earned</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                  <div className="flex-shrink-0">
                    {activity.type === "quiz" ? (
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Code2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      {activity.type === "quiz" && activity.score && <span>Score: {activity.score}%</span>}
                      {activity.type === "project" && <span>{activity.completed ? "Completed" : "In Progress"}</span>}
                      <span>•</span>
                      <span>{activity.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
