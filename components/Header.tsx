import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              PengVision
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};