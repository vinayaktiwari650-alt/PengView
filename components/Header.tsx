import React from 'react';

interface HeaderProps {
  currentUser: string | null;
  onLogout: () => void;
  onOpenProjects: () => void;
}


export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onOpenProjects }) => {
  return (
    <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              PengVision
            </h1>
          </div>
           {currentUser && (
            <div className="flex items-center gap-4">
              <span className="text-gray-300 hidden sm:block">Welcome, {currentUser}</span>
              <button onClick={onOpenProjects} className="text-sm font-medium text-white hover:text-cyan-400 transition-colors">My Projects</button>
              <button onClick={onLogout} className="text-sm font-medium text-white hover:text-cyan-400 transition-colors">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
