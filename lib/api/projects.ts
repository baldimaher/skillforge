// Service API pour les projets
export class ProjectsAPI {
    // Récupérer tous les projets
    async getProjects() {
      try {
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        throw error;
      }
    }
  
    // Récupérer un projet spécifique
    async getProject(id: string) {
      try {
        const response = await fetch(`/api/projects/${id}`);
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Erreur lors de la récupération du projet:', error);
        throw error;
      }
    }
  
    // Créer un nouveau projet (admin uniquement)
    async createProject(projectData: any) {
      try {
        const userRole = localStorage.getItem('userRole') || 'user';
        
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': userRole
          },
          body: JSON.stringify(projectData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erreur ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Erreur lors de la création du projet:', error);
        throw error;
      }
    }
  
    // Mettre à jour un projet (admin uniquement)
    async updateProject(id: string, projectData: any) {
      try {
        const userRole = localStorage.getItem('userRole') || 'user';
        
        const response = await fetch(`/api/projects/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': userRole
          },
          body: JSON.stringify(projectData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erreur ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Erreur lors de la mise à jour du projet:', error);
        throw error;
      }
    }
  
    // Supprimer un projet (admin uniquement)
    async deleteProject(id: string) {
      try {
        const userRole = localStorage.getItem('userRole') || 'user';
        
        const response = await fetch(`/api/projects/${id}`, {
          method: 'DELETE',
          headers: {
            'x-user-role': userRole
          }
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erreur ${response.status}`);
        }
  
        return true;
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        throw error;
      }
    }
  }