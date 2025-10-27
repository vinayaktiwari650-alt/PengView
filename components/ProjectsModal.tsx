import React from 'react';
import type { Project } from '../types';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onLoadProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({ isOpen, onClose, projects, onLoadProject, onDeleteProject }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">My Projects</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">You have no saved projects.</p>
          ) : (
            <ul className="space-y-3">
              {projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(project => (
                <li key={project.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <img src={project.image.dataUrl} alt={project.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-white font-semibold truncate">{project.name}</p>
                      <p className="text-gray-400 text-sm">
                        Saved on {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => onLoadProject(project.id)} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-md transition-colors">Load</button>
                    <button onClick={() => { if (window.confirm('Are you sure you want to delete this project?')) onDeleteProject(project.id); }} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
