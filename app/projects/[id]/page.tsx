"use client";

import {
    BookOpen,
    CheckCircle,
    ChevronDown,
    Clock,
    Code2,
    Copy,
    Download,
    Github,
    ListTodo,
    Target,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

import BackendProgressTracker from "@/components/ui/backend-progress-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Project {
    _id: string;
    title: string;
    description: string;
    difficulty?: string;
    duration?: string;
    technologies?: string[];
    objectives?: string[];
    prerequisites?: string[];
    resources?: string[];
    githubUrl?: string;
    demoUrl?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export default function ProjectDetailsPage() {
    const params = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showProgressTracker, setShowProgressTracker] = useState(false);

    useEffect(() => {
        async function fetchProject() {
            try {
                setLoading(true);
                const response = await fetch(`/api/projects/${params.id}`);
                if (!response.ok) {
                    throw new Error("Échec de la récupération du projet");
                }
                const data = await response.json();
                setProject(data);
            } catch (err: any) {
                setError(err.message);
                console.error("Erreur lors de la récupération du projet :", err);
            } finally {
                setLoading(false);
            }
        }

        if (params.id) {
            fetchProject();
        }
    }, [params.id]);

    function getDifficultyColor(difficulty?: string) {
        switch (difficulty) {
            case "Beginner":
                return "bg-green-100 text-green-800";
            case "Intermediate":
                return "bg-yellow-100 text-yellow-800";
            case "Advanced":
                return "bg-red-100 text-red-800";
            default:
                return "";
        }
    }

    if (loading)
        return <div className="text-center py-10">Chargement du projet...</div>;
    if (error)
        return <div className="text-center py-10 text-red-500">Erreur: {error}</div>;
    if (!project)
        return <div className="text-center py-10">Projet non trouvé</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4">
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-slate-900">
                            {project.title}
                        </h1>
                        <p className="text-lg text-slate-600">{project.description}</p>
                    </div>
                    {project.difficulty && (
                        <Badge className={getDifficultyColor(project.difficulty)}>
                            {project.difficulty}
                        </Badge>
                    )}
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                    {project.status && <p><strong>Statut :</strong> {project.status}</p>}
                    {project.createdAt && <p><strong>Créé le :</strong> {new Date(project.createdAt).toLocaleDateString()}</p>}
                    {project.updatedAt && <p><strong>Mis à jour :</strong> {new Date(project.updatedAt).toLocaleDateString()}</p>}
                </div>
            </div>

            {project.status === "terminé" && (
                <div className="mt-6 bg-green-100 text-green-800 border border-green-300 rounded-lg p-4 text-center flex items-center justify-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-semibold">
                        Félicitations ! Le projet <strong>"{project.title}"</strong> est terminé 🎉
                    </span>
                </div>
            )}

            {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code2 className="h-5 w-5" /> Technologies
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, index) => (
                                <Badge key={index} variant="outline">
                                    {tech}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {project.duration && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" /> Durée estimée
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{project.duration}</p>
                    </CardContent>
                </Card>
            )}

            {project.objectives && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" /> Objectifs
                        </CardTitle>
                        <CardDescription>Ce que vous allez apprendre</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {project.objectives.map((objective, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                    <span>{objective}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {project.prerequisites && (
                <Card>
                    <CardHeader>
                        <CardTitle>Prérequis</CardTitle>
                        <CardDescription>Ce que vous devez savoir avant de commencer</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {project.prerequisites.map((prereq, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                    <span className="text-blue-600 mt-1">•</span>
                                    {prereq}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {project.resources && project.resources.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Ressources utiles</CardTitle>
                        <CardDescription>Documentation et guides pour vous aider</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {project.resources.map((resource, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span className="text-blue-600 hover:underline cursor-pointer">
                                        {resource}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {showInstructions && (
                <Card className="mt-6 border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle>Instructions pour démarrer</CardTitle>
                        <CardDescription>Suivez ces étapes pour commencer le projet</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">1. Cloner le dépôt</h3>
                            <div className="bg-slate-800 text-white p-3 rounded-md font-mono text-sm">
                                git clone {project.githubUrl || "[URL du dépôt GitHub]"}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">2. Installer les dépendances</h3>
                            <div className="bg-slate-800 text-white p-3 rounded-md font-mono text-sm">
                                cd [nom-du-projet]
                                <br />
                                npm install
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">3. Lancer le projet</h3>
                            <div className="bg-slate-800 text-white p-3 rounded-md font-mono text-sm">
                                npm run dev
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">4. Ouvrir dans le navigateur</h3>
                            <p>
                                Accédez à <span className="font-mono bg-slate-100 px-2 py-1 rounded">http://localhost:3000</span>
                            </p>
                        </div>
                        <div className="pt-2">
                            <Button variant="outline" onClick={() => setShowInstructions(false)}>
                                Masquer les instructions
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex gap-4 pt-4 flex-wrap">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="lg" className="flex-1 min-w-[180px]">
                            Démarrer le projet <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuItem onClick={() => setShowInstructions(!showInstructions)}>
                            <BookOpen className="mr-2 h-4 w-4" /> Voir les instructions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowProgressTracker(!showProgressTracker)}>
                            <ListTodo className="mr-2 h-4 w-4" /> Gérer les étapes
                        </DropdownMenuItem>
                        {project.githubUrl && (
                            <DropdownMenuItem onClick={() => window.open(project.githubUrl, "_blank")}>
                                <Github className="mr-2 h-4 w-4" /> Cloner le dépôt
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(`git clone ${project.githubUrl || "URL_DU_REPO"}`);
                            alert("Commande copiée dans le presse-papier !");
                        }}>
                            <Copy className="mr-2 h-4 w-4" /> Copier la commande git
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/projects/${project._id}/download`, "_blank")}>
                            <Download className="mr-2 h-4 w-4" /> Télécharger les fichiers
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

               

                {project.githubUrl && (
                    <Button variant="outline" size="lg" onClick={() => window.open(project.githubUrl, "_blank")}>GitHub</Button>
                )}

                {project.demoUrl && (
                    <Button variant="outline" size="lg" onClick={() => window.open(project.demoUrl, "_blank")}>Démo</Button>
                )}
            </div>

            {showProgressTracker && (
                <BackendProgressTracker
                    projectId={project._id}
                    projectTitle={project.title}
                />
            )}
        </div>
    );
}