import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Code2, Target } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const projectData = {
  id: 1,
  title: "Build a React Todo App",
  description:
    "Create a fully functional todo application using React hooks and local storage. This project will teach you the fundamentals of React development, state management, and modern JavaScript practices.",
  difficulty: "Beginner",
  duration: "2-3 hours",
  technologies: ["React", "JavaScript", "CSS", "HTML"],
  objectives: [
    "Set up a React project with Create React App",
    "Implement CRUD operations for todos",
    "Use React hooks (useState, useEffect) for state management",
    "Style components with CSS modules or styled-components",
    "Implement local storage for data persistence",
    "Add filtering and sorting functionality",
    "Create responsive design for mobile devices",
    "Write unit tests for components",
  ],
  prerequisites: [
    "Basic knowledge of JavaScript ES6+",
    "Understanding of HTML and CSS",
    "Familiarity with React concepts (components, props, state)",
  ],
  resources: ["React Documentation", "MDN Web Docs", "CSS Grid and Flexbox Guide", "Testing Library Documentation"],
}

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

export default function ProjectDetailsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">{projectData.title}</h1>
            <p className="text-lg text-slate-600">{projectData.description}</p>
          </div>
          <Badge className={getDifficultyColor(projectData.difficulty)}>{projectData.difficulty}</Badge>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{projectData.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>{projectData.objectives.length} objectives</span>
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            <span>{projectData.technologies.length} technologies</span>
          </div>
        </div>
      </div>

      {/* Technologies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Technologies You'll Use
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {projectData.technologies.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-sm px-3 py-1">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Learning Objectives
          </CardTitle>
          <CardDescription>What you'll accomplish by completing this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {projectData.objectives.map((objective, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{objective}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
          <CardDescription>What you should know before starting this project</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {projectData.prerequisites.map((prerequisite, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-blue-600 mt-1">•</span>
                {prerequisite}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Helpful Resources</CardTitle>
          <CardDescription>Documentation and guides to help you succeed</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {projectData.resources.map((resource, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-blue-600 hover:underline cursor-pointer">{resource}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button size="lg" className="flex-1">
          Start Project
        </Button>
        <Button variant="outline" size="lg">
          Save for Later
        </Button>
        <Button variant="outline" size="lg">
          Share Project
        </Button>
      </div>
    </div>
  )
}
