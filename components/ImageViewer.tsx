import React from 'react';

interface ImageViewerProps {
  title: string;
  imageUrl: string;
  onDownload?: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ title, imageUrl, onDownload }) => {
  return (
    <div className="w-full flex flex-col">
      <div className="group relative aspect-w-16 aspect-h-9 w-full bg-black rounded-lg overflow-hidden shadow-inner border border-gray-800">
        <img
          src={imageUrl}
          alt={title}
          className="object-contain w-full h-full"
        />
        {onDownload && (
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                    onClick={onDownload}
                    className="p-3 bg-white/80 hover:bg-white rounded-full text-black transition-colors"
                    aria-label={`Download ${title}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
            </div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-center mt-3 text-white">{title}</h3>
    </div>
  );
};