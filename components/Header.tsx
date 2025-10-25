import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 21V19.5C8.5 16.4624 10.9624 14 14 14C15.5 14 18.5 15 18.5 17C18.5 19 15.5 21 12 21H8.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 14C14.8284 14 15.5 11.9853 15.5 9.5C15.5 7.01472 14.8284 5 14 5C13.1716 5 12.5 7.01472 12.5 9.5C12.5 11.9853 13.1716 14 14 14Z" />
                <circle cx="14.5" cy="8.5" r="0.5" fill="currentColor" />
            </svg>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              PengView <span className="font-normal">Vision</span>
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};
