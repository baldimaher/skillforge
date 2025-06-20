import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const projects = [
  {
    id: 1,
    title: "Build a React Todo App",
    description:
      "Create a fully functional todo application using React hooks and local storage. Learn state management, event handling, and component composition.",
    difficulty: "Beginner",
    duration: "2-3 hours",
    technologies: ["React", "JavaScript", "CSS"],
    objectives: [
      "Set up a React project with Create React App",
      "Implement CRUD operations for todos",
      "Use React hooks for state management",
      "Style components with CSS modules",
    ],
  },
  {
    id: 2,
    title: "REST API with Node.js",
    description:
      "Develop a RESTful API using Node.js, Express, and MongoDB. Learn backend development fundamentals and database integration.",
    difficulty: "Intermediate",
    duration: "4-6 hours",
    technologies: ["Node.js", "Express", "MongoDB"],
    objectives: [
      "Set up Express server with middleware",
      "Design and implement REST endpoints",
      "Connect to MongoDB database",
      "Implement authentication and validation",
    ],
  },
  {
    id: 3,
    title: "Full-Stack E-commerce",
    description:
      "Build a complete e-commerce platform with authentication, product management, and payment processing using modern technologies.",
    difficulty: "Advanced",
    duration: "15-20 hours",
    technologies: ["Next.js", "PostgreSQL", "Stripe"],
    objectives: [
      "Build responsive frontend with Next.js",
      "Implement user authentication system",
      "Create product catalog and shopping cart",
      "Integrate Stripe payment processing",
    ],
  },
]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-100 text-green-800 border-green-200"
    case "Intermediate":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Advanced":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
        <p className="text-slate-600 mt-2">Build real-world applications and strengthen your skills</p>
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="text-base">{project.description}</CardDescription>
                </div>
                <Badge className={getDifficultyColor(project.difficulty)}>{project.difficulty}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>⏱️ {project.duration}</span>
                  <span>📋 {project.objectives.length} objectives</span>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Learning Objectives</h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    {project.objectives.slice(0, 2).map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        {objective}
                      </li>
                    ))}
                    {project.objectives.length > 2 && (
                      <li className="text-slate-500">+{project.objectives.length - 2} more objectives</li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Link href={`/projects/${project.id}`} className="flex-1">
                    <Button className="w-full">View Details</Button>
                  </Link>
                  <Button variant="outline">Preview</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
