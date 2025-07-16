// app/components/BackendProgressTracker.tsx
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
import TaskStatusUpdater from "../../app/projects/TaskStatusUpdater";
import { toast } from "@/components/ui/use-toast";

interface Step {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  hours: number;
  projectId: string;
  userId: string;
  startDate?: string;
  endDate?: string;
}

interface Props {
  projectId: string;
  projectTitle: string;
}

export default function BackendProgressTracker({
  projectId,
  projectTitle,
}: Props) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newStep, setNewStep] = useState({
    title: "",
    description: "",
    hours: 1,
    priority: "medium" as "low" | "medium" | "high",
  });
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handlePrint = () => window.print();

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user._id) {
        throw new Error("Utilisateur non connecté. Veuillez vous connecter.");
      }

      const tasksRes = await fetch(
        `/api/projects/${projectId}/tasks?userId=${user._id}`
      );
      if (!tasksRes.ok) {
        const errorData = await tasksRes.json();
        throw new Error(
          errorData.message || "Erreur lors du chargement des tâches"
        );
      }
      const tasksData = await tasksRes.json();
      setSteps(Array.isArray(tasksData) ? tasksData : []);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des données");
      console.error("Erreur loadData:", err);
      toast({
        title: "Erreur",
        description: err.message || "Erreur serveur",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addStep = async () => {
    if (!newStep.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre est requis",
        variant: "destructive",
      });
      return;
    }
    if (!user._id) {
      toast({
        title: "Erreur",
        description: "Utilisateur non connecté",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          title: newStep.title,
          description: newStep.description,
          priority: newStep.priority,
          hours: newStep.hours,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        await loadData();
        setNewStep({
          title: "",
          description: "",
          hours: 1,
          priority: "medium",
        });
        setShowAddDialog(false);
        toast({ title: "Succès", description: "Étape ajoutée avec succès" });
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de l'ajout",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'ajout");
      toast({
        title: "Erreur",
        description: err.message || "Erreur serveur",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const deleteStep = async (stepId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: stepId }),
      });
      if (res.ok) {
        await loadData();
        toast({ title: "Succès", description: "Étape supprimée" });
      } else {
        const data = await res.json();
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la suppression",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression");
      toast({
        title: "Erreur",
        description: err.message || "Erreur serveur",
        variant: "destructive",
      });
    }
  };

  const handleProjectCompleted = () => {
    toast({
      title: "Félicitations !",
      description: `Le projet "${projectTitle}" est terminé !`,
    });
  };

  const stats = {
    total: steps.length || 0,
    done: steps.filter((s) => s.status === "done").length,
    doing: steps.filter((s) => s.status === "doing").length,
    totalHours: steps.reduce((sum, s) => sum + s.hours, 0),
    doneHours: steps
      .filter((s) => s.status === "done")
      .reduce((sum, s) => sum + s.hours, 0),
  };

  const progress = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;
  const allTasksDone = stats.total > 0 && stats.done === stats.total;

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
              <Target className="h-5 w-5" /> Suivi des étapes - {projectTitle}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Connecté au backend - Données synchronisées
            </p>
          </div>
          <div className="flex gap-2 no-print">
            <Button variant="outline" onClick={handlePrint}>
              🖨️ Imprimer
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button disabled={!!error}>
                  <Plus className="h-4 w-4 mr-2" /> Ajouter
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
                  <div>
                    <Label>Description (optionnel)</Label>
                    <Input
                      value={newStep.description}
                      onChange={(e) =>
                        setNewStep({ ...newStep, description: e.target.value })
                      }
                      placeholder="Description de l'étape"
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
                  <Button onClick={addStep} disabled={isAdding}>
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}{" "}
                    Ajouter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {allTasksDone && (
          <div className="mt-6 bg-green-100 text-green-800 border border-green-300 rounded-lg p-4 text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">Projet terminé 🎉</span>
          </div>
        )}
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
                    <div>
                      <span className="font-medium">{step.title}</span>
                      {step.description && (
                        <p className="text-sm text-gray-600">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <TaskStatusUpdater
                    taskId={step._id}
                    projectId={projectId}
                    currentStatus={step.status}
                    onProjectCompleted={handleProjectCompleted}
                  />
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
                  {step.userId === user._id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteStep(step._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {steps.length === 0 && (
          <p className="text-center text-gray-600 mt-4">
            Aucune étape créée pour ce projet. Ajoutez-en une pour commencer !
          </p>
        )}
      </CardContent>
    </Card>
  );
}