import React, { useState, useEffect } from 'react';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectName: string) => void;
  currentProjectName?: string;
}

export const SaveProjectModal: React.FC<SaveProjectModalProps> = ({ isOpen, onClose, onSave, currentProjectName }) => {
  const [name, setName] = useState(currentProjectName || '');

  useEffect(() => {
    if (isOpen) {
      setName(currentProjectName || '');
    }
  }, [currentProjectName, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">{currentProjectName ? 'Update Project Name' : 'Save New Project'}</h2>
        <label htmlFor="project-name" className="text-sm text-gray-400">Project Name</label>
        <input
          id="project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Downtown Library Concept"
          className="w-full mt-1 mb-6 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!name.trim()} className="px-4 py-2 bg-white hover:bg-gray-200 text-black font-semibold rounded-md transition-colors disabled:opacity-50">Save</button>
        </div>
      </div>
    </div>
  );
};
