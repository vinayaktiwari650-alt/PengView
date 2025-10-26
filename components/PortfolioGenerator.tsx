

import React, { useState, useCallback } from 'react';
import { ImageViewer } from './ImageViewer';
import { Spinner } from './Spinner';
import { generateArchitecturalImage } from '../services/geminiService';
import type { ImageFile, PortfolioData } from '../types';
import { fileToGenerativePart } from '../utils/fileUtils';
import * as JSZip from 'jszip';

const PORTFOLIO_PROMPTS = [
  { title: '3D Block Model', prompt: 'Create a simple, untextured 3D block model of this building, showing its basic geometric form. The style should be clean and minimalist, like a gray or white clay model.' },
  { title: 'Photorealistic Night Render', prompt: 'Reimagine this building as a photorealistic night scene with dramatic, warm lighting' },
  { title: 'Architectural Floor Plans', prompt: 'Illustrate a creative concept for a possible floor plan layout for this building, shown from a top-down perspective' },
  { title: 'Conceptual Design Sketches', prompt: "Generate a collage of artistic, hand-drawn architectural sketches of this building. Show different angles and perspectives, as if from a designer's sketchbook." },
  { title: 'Elevation Drawing', prompt: 'Produce a clean, technical-style front elevation drawing of this building' },
  { title: 'Conceptual Sketches of Details', prompt: "Produce a detailed, artistic sketch focusing on a unique architectural detail of this building, such as the entryway, a window, or a material texture. The style should be clean line work." },
  { title: 'Aerial View', prompt: "Create a photorealistic image showing an aerial drone view of this building and its surroundings." },
  { title: 'Side View', prompt: "Create a photorealistic image showing a side profile of this building from street level." },
  { title: "Ant's Eye View", prompt: "Create a dramatic, low-angle, ant's eye perspective looking up at this building's facade." },
  { title: 'Interior View', prompt: "Create a photorealistic image imagining the main interior space of this building, focusing on light and atmosphere." },
];

interface PortfolioGeneratorProps {
    image: ImageFile;
    portfolioData: PortfolioData | null;
    // FIX: Update prop type to allow functional updates for state.
    setPortfolioData: React.Dispatch<React.SetStateAction<PortfolioData | null>>;
}

export const PortfolioGenerator: React.FC<PortfolioGeneratorProps> = ({ image, portfolioData, setPortfolioData }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generatedAssets = portfolioData?.assets || [];
  const generationProgress = portfolioData?.progress || {};

  const handleGeneratePortfolio = useCallback(async () => {
    if (!image) {
      setError('Image data is missing.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    const initialProgress = PORTFOLIO_PROMPTS.reduce((acc, item) => {
        acc[item.title] = 'loading';
        return acc;
    }, {} as PortfolioData['progress']);
    setPortfolioData({ assets: [], progress: initialProgress });

    try {
      const imagePart = await fileToGenerativePart(image.dataUrl, image.type);
      
      for (const item of PORTFOLIO_PROMPTS) {
        try {
          const result = await generateArchitecturalImage(imagePart, item.prompt);
          setPortfolioData(prev => ({
            ...prev!,
            assets: [...(prev?.assets || []), { title: item.title, imageUrl: result }],
            progress: { ...prev!.progress, [item.title]: 'success' }
          }));
        } catch (err) {
          console.error(`Failed to generate ${item.title}:`, err);
          setError(`Failed to generate ${item.title}:\n${err instanceof Error ? err.message : String(err)}`);
          setPortfolioData(prev => ({
              ...prev!,
              progress: { ...prev!.progress, [item.title]: 'error' }
          }));
        }
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during setup.');
      setPortfolioData(null); // Clear progress on setup failure
    } finally {
      setIsLoading(false);
    }
  }, [image, setPortfolioData]);

  const handleDownloadImage = (imageUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDownloadAll = async () => {
    if (generatedAssets.length === 0) return;

    const zip = new (JSZip as any)();
    
    const imagePromises = generatedAssets.map(async (asset) => {
      const response = await fetch(asset.imageUrl);
      const blob = await response.blob();
      const filename = `${asset.title.replace(/\s+/g, '_')}.png`;
      zip.file(filename, blob);
    });

    await Promise.all(imagePromises);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = 'PengVision_Portfolio.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const ProgressIcon = ({ status }: { status: 'loading' | 'success' | 'error' }) => {
    if (status === 'loading') return <Spinner />;
    if (status === 'success') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
    if (status === 'error') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
    return null;
  };

  return (
    <div className="flex flex-col gap-6">
       <h2 className="text-2xl font-bold text-white">Architectural Portfolio Generator</h2>
      <button
        onClick={handleGeneratePortfolio}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-white hover:bg-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed text-black font-bold text-lg rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
      >
        {isLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
        {isLoading ? 'Generating Portfolio...' : 'Generate Full Architectural Portfolio'}
      </button>

      {error && (
        <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg whitespace-pre-wrap">
          <h3 className="font-bold text-lg mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {Object.keys(generationProgress).length > 0 && (
          <div className="flex flex-col gap-2 p-4 bg-black/50 border border-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-center mb-2 text-white">{isLoading ? 'Generation in Progress...' : 'Generation Complete'}</h3>
              {PORTFOLIO_PROMPTS.map(item => (
                  <div key={item.title} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg text-sm">
                      <span>{item.title}</span>
                      {generationProgress[item.title] && <ProgressIcon status={generationProgress[item.title]} />}
                  </div>
              ))}
                {generatedAssets.length > 0 && !isLoading && (
                  <button 
                      onClick={handleDownloadAll}
                      className="mt-4 w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download All as .zip
                  </button>
              )}
          </div>
      )}

      {generatedAssets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              {PORTFOLIO_PROMPTS
                  .map(p => generatedAssets.find(a => a.title === p.title))
                  .filter(Boolean)
                  .map((asset) => asset && (
                      <ImageViewer key={asset.title} title={asset.title} imageUrl={asset.imageUrl} onDownload={() => handleDownloadImage(asset.imageUrl, asset.title)} />
                  ))
              }
          </div>
      ) : !isLoading && Object.keys(generationProgress).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 pt-10">
          <p className="text-lg">Your generated portfolio will appear here.</p>
        </div>
      ) : null}
    </div>
  );
};