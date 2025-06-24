"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Loader2,
  Plus,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreateStepData,
  Step,
  UpdateStepData,
  stepsAPI,
} from "../../lib/api/steps";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  projectId: string;
  projectTitle: string;
}

// Étapes par défaut à créer si aucune n'existe
const DEFAULT_STEPS: CreateStepData[] = [
  { title: "Configuration environnement", priority: "high", hours: 2 },
  { title: "Analyse des exigences", priority: "high", hours: 3 },
  { title: "Conception architecture", priority: "medium", hours: 4 },
  { title: "Développement principal", priority: "high", hours: 8 },
  { title: "Tests et débogage", priority: "medium", hours: 3 },
  { title: "Documentation", priority: "low", hours: 2 },
];

export default function BackendProgressTracker({
  projectId,
  projectTitle,
}: Props) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStep, setNewStep] = useState<CreateStepData>({
    title: "",
    hours: 1,
    priority: "medium",
  });

  // Charger les étapes depuis le backend
  useEffect(() => {
    loadSteps();
  }, [projectId]);

  const loadSteps = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stepsAPI.getSteps(projectId);

      // Si aucune étape n'existe, créer les étapes par défaut
      if (data.length === 0) {
        await createDefaultSteps();
      } else {
        setSteps(data);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des étapes");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSteps = async () => {
    try {
      const createdSteps: Step[] = [];
      for (const stepData of DEFAULT_STEPS) {
        const step = await stepsAPI.createStep(projectId, stepData);
        createdSteps.push(step);
      }
      setSteps(createdSteps);
    } catch (err: any) {
      setError("Erreur lors de la création des étapes par défaut");
      console.error("Erreur:", err);
    }
  };

  // Mettre à jour une étape
  const updateStep = async (stepId: string, updates: UpdateStepData) => {
    try {
      const updatedStep = await stepsAPI.updateStep(projectId, stepId, updates);
      setSteps((prev) =>
        prev.map((step) => (step._id === stepId ? updatedStep : step))
      );
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour");
      console.error("Erreur:", err);
    }
  };

  // Ajouter une étape
  const addStep = async () => {
    if (!newStep.title.trim()) return;

    try {
      const step = await stepsAPI.createStep(projectId, newStep);
      setSteps((prev) => [...prev, step]);
      setNewStep({ title: "", hours: 1, priority: "medium" });
      setShowAddDialog(false);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'ajout");
      console.error("Erreur:", err);
    }
  };

  // Supprimer une étape
  const deleteStep = async (stepId: string) => {
    try {
      await stepsAPI.deleteStep(projectId, stepId);
      setSteps((prev) => prev.filter((step) => step._id !== stepId));
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression");
      console.error("Erreur:", err);
    }
  };

  // Calculer les statistiques
  const stats = {
    total: steps.length,
    done: steps.filter((s) => s.status === "done").length,
    doing: steps.filter((s) => s.status === "doing").length,
    totalHours: steps.reduce((sum, s) => sum + s.hours, 0),
    doneHours: steps
      .filter((s) => s.status === "done")
      .reduce((sum, s) => sum + s.hours, 0),
  };

  const progress = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;

  // Fonctions utilitaires
  const getStatusIcon = (status: Step["status"]) => {
    switch (status) {
      case "done":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "doing":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Step["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
    }
  };

  const getStatusText = (status: Step["status"]) => {
    switch (status) {
      case "todo":
        return "À faire";
      case "doing":
        return "En cours";
      case "done":
        return "Terminé";
    }
  };

  const getPriorityText = (priority: Step["priority"]) => {
    switch (priority) {
      case "high":
        return "Haute";
      case "medium":
        return "Moyenne";
      case "low":
        return "Basse";
    }
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Chargement des étapes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Suivi des étapes - {projectTitle}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Connecté au backend - Données synchronisées
            </p>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle étape</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={newStep.title}
                    onChange={(e) =>
                      setNewStep({ ...newStep, title: e.target.value })
                    }
                    placeholder="Nom de l'étape"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priorité</Label>
                    <Select
                      value={newStep.priority}
                      onValueChange={(value) =>
                        setNewStep({
                          ...newStep,
                          priority: value as Step["priority"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Heures</Label>
                    <Input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={newStep.hours}
                      onChange={(e) =>
                        setNewStep({
                          ...newStep,
                          hours: parseFloat(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Annuler
                </Button>
                <Button onClick={addStep}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {/* Affichage des erreurs */}
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Progression</p>
                  <p className="text-2xl font-bold">{progress.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Terminées</p>
                  <p className="text-2xl font-bold">
                    {stats.done}/{stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">En cours</p>
                  <p className="text-2xl font-bold">{stats.doing}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Heures</p>
                  <p className="text-2xl font-bold">
                    {stats.doneHours}/{stats.totalHours}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression globale</span>
            <span className="text-sm text-gray-600">
              {stats.done}/{stats.total} étapes
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tableau des étapes */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Étape</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Heures</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.map((step) => (
              <TableRow key={step._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(step.status)}
                    <span className="font-medium">{step.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={step.status}
                    onValueChange={(value) =>
                      updateStep(step._id!, { status: value as Step["status"] })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">À faire</SelectItem>
                      <SelectItem value="doing">En cours</SelectItem>
                      <SelectItem value="done">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(step.priority)}>
                    {getPriorityText(step.priority)}
                  </Badge>
                </TableCell>
                <TableCell>{step.hours}h</TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {step.startDate && (
                      <div>
                        Début: {new Date(step.startDate).toLocaleDateString()}
                      </div>
                    )}
                    {step.endDate && (
                      <div>
                        Fin: {new Date(step.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteStep(step._id!)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}