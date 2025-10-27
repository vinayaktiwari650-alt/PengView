import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 backdrop-blur-md flex items-center justify-center z-50">
      <div className="w-full max-w-sm p-8 bg-black/50 border border-gray-700 rounded-2xl shadow-2xl text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          PengVision
        </h1>
        <p className="text-gray-400 mb-8">Your AI toolkit for architecture.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name to begin"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            aria-label="Username"
          />
          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full mt-6 py-3 px-4 bg-white hover:bg-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed text-black font-bold text-lg rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
};
