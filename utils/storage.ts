import type { Project } from '../types';

const PROJECTS_KEY = 'pengvision_projects';
const USER_KEY = 'pengvision_currentUser';

// User Management
export function getCurrentUser(): string | null {
    return localStorage.getItem(USER_KEY);
}

export function setCurrentUser(username: string): void {
    localStorage.setItem(USER_KEY, username);
}

export function clearCurrentUser(): void {
    localStorage.removeItem(USER_KEY);
}

// Project Management
function getAllProjects(): Record<string, Project[]> {
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : {};
}

export function getUserProjects(username: string): Project[] {
    const allProjects = getAllProjects();
    return allProjects[username] || [];
}

export function saveUserProject(username: string, project: Project): void {
    const allProjects = getAllProjects();
    if (!allProjects[username]) {
        allProjects[username] = [];
    }
    
    const projectIndex = allProjects[username].findIndex(p => p.id === project.id);
    if (projectIndex > -1) {
        // Update existing project
        allProjects[username][projectIndex] = project;
    } else {
        // Add new project
        allProjects[username].unshift(project); // Add to the beginning of the list
    }

    localStorage.setItem(PROJECTS_KEY, JSON.stringify(allProjects));
}

export function deleteUserProject(username: string, projectId: string): void {
    const allProjects = getAllProjects();
    if (allProjects[username]) {
        allProjects[username] = allProjects[username].filter(p => p.id !== projectId);
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(allProjects));
    }
}
