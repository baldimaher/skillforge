// Types
export interface Step {
  _id?: string;
  projectId: string;
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  hours: number;
  actualHours?: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStepData {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  hours: number;
  notes?: string;
}

export interface UpdateStepData {
  title?: string;
  description?: string;
  status?: "todo" | "doing" | "done";
  priority?: "low" | "medium" | "high";
  hours?: number;
  actualHours?: number;
  notes?: string;
}

// Service API pour les étapes
export class StepsAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "/api/projects";
  }

  // Récupérer toutes les étapes d'un projet
  async getSteps(projectId: string, userId: string): Promise<Step[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/steps`, {
        headers: {
          "x-user-id": userId,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des étapes:", error);
      throw error;
    }
  }

  // Créer une nouvelle étape
  async createStep(
    projectId: string,
    stepData: CreateStepData,
    userId: string
  ): Promise<Step> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/steps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(stepData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la création de l'étape:", error);
      throw error;
    }
  }

  // Mettre à jour une étape
  async updateStep(
    projectId: string,
    stepId: string,
    updateData: UpdateStepData
  ): Promise<Step> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${projectId}/steps/${stepId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'étape:", error);
      throw error;
    }
  }

  // Supprimer une étape
  async deleteStep(projectId: string, stepId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${projectId}/steps/${stepId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'étape:", error);
      throw error;
    }
  }

  // Réorganiser les étapes
  async reorderSteps(projectId: string, steps: Step[]): Promise<Step[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/steps`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ steps }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la réorganisation des étapes:", error);
      throw error;
    }
  }
}

// Instance singleton
export const stepsAPI = new StepsAPI();