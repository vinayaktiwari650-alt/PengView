

import React, { useState, useCallback } from 'react';
import { Spinner } from './Spinner';
import { ImageViewer } from './ImageViewer';
import { analyzeBuilding, generateArchitecturalImage } from '../services/geminiService';
import type { ImageFile, AnalysisData } from '../types';
import { fileToGenerativePart } from '../utils/fileUtils';

const ANALYSIS_STAGES = ['Aerial View Generation', 'Textual Analysis'];

interface BuildingAnalyzerProps {
  image: ImageFile;
  analysisData: AnalysisData | null;
  // FIX: Update prop type to allow functional updates for state.
  setAnalysisData: React.Dispatch<React.SetStateAction<AnalysisData | null>>;
}

export const BuildingAnalyzer: React.FC<BuildingAnalyzerProps> = ({ image, analysisData, setAnalysisData }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analysisText = analysisData?.text || null;
  const generatedAsset = analysisData?.assets?.[0] || null;
  const generationProgress = analysisData?.progress || {};

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const initialProgress = ANALYSIS_STAGES.reduce((acc, stage) => {
        acc[stage] = 'loading';
        return acc;
    }, {} as AnalysisData['progress']);
    setAnalysisData({ text: null, assets: [], progress: initialProgress });

    try {
      const originalImagePart = await fileToGenerativePart(image.dataUrl, image.type);

      // 1. Generate Aerial View
      let aerialImageUrl = '';
      try {
        aerialImageUrl = await generateArchitecturalImage(originalImagePart, "Create a photorealistic image showing an aerial drone view of this building and its surroundings.");
        setAnalysisData(prev => ({
          ...prev!,
          assets: [{ title: 'Aerial View', imageUrl: aerialImageUrl }],
          progress: { ...prev!.progress, 'Aerial View Generation': 'success' }
        }));
      } catch (err) {
        console.error('Failed to generate aerial view:', err);
        setAnalysisData(prev => ({ ...prev!, progress: { ...prev!.progress, 'Aerial View Generation': 'error' } }));
        throw new Error('Failed to generate the aerial view for analysis.');
      }

      // 2. Generate Textual Analysis from the generated Aerial View
      try {
        const aerialImagePart = await fileToGenerativePart(aerialImageUrl, 'image/png');
        const result = await analyzeBuilding(aerialImagePart);
        setAnalysisData(prev => ({ ...prev!, text: result, progress: { ...prev!.progress, 'Textual Analysis': 'success' } }));
      } catch (err) {
        console.error('Failed to generate textual analysis:', err);
        setAnalysisData(prev => ({ ...prev!, progress: { ...prev!.progress, 'Textual Analysis': 'error' } }));
        throw new Error('Failed to generate textual analysis from the aerial view.');
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis generation.');
    } finally {
      setIsLoading(false);
    }
  }, [image, setAnalysisData]);
  
  const handleDownloadImage = (imageUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadMarkdown = () => {
    if (!analysisText) return;
    const blob = new Blob([analysisText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PengVision_Aerial_Analysis.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const ProgressIcon = ({ status }: { status: 'loading' | 'success' | 'error' }) => {
    if (status === 'loading') return <Spinner />;
    if (status === 'success') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
    if (status === 'error') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
    return null;
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-black/30 border border-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white">Aerial View &amp; Analysis</h2>
       <p className="text-sm text-gray-400">
        First, generate a photorealistic aerial view of the building, then receive a detailed analysis based on that new perspective.
      </p>
      <button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="w-full py-3 px-4 bg-white hover:bg-gray-200 disabled:bg-gray-500 text-black font-bold text-lg rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
      >
        {isLoading ? <Spinner /> : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5.966-3.042A1 1 0 015 14v-2.01a1 1 0 01.527-.882l2.94-1.715a1 1 0 011.054 1.764l-2.02 1.178 2.02 1.178a1 1 0 01-1.054 1.764l-2.94-1.715A1 1 0 014 11.99V10a1 1 0 112 0v.151l1.13 1.13A4.004 4.004 0 0110 6a4 4 0 11-2.828 6.828L6.04 13.96A6 6 0 1010 4a6 6 0 00-5.966 10.958z" clipRule="evenodd" />
            </svg>
        )}
        {isLoading ? 'Generating...' : 'Generate Aerial View & Analysis'}
      </button>

      {error && (
        <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg"><p>{error}</p></div>
      )}

      {Object.keys(generationProgress).length > 0 && (
          <div className="flex flex-col gap-2 p-4 bg-black/50 border border-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-center mb-2 text-white">{isLoading ? 'Analysis in Progress...' : 'Analysis Complete'}</h3>
              {ANALYSIS_STAGES.map(stage => (
                  <div key={stage} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg text-sm">
                      <span>{stage}</span>
                      {generationProgress[stage] && <ProgressIcon status={generationProgress[stage]} />}
                  </div>
              ))}
          </div>
      )}
      
      {(analysisText || generatedAsset) ? (
        <div className="mt-4 flex flex-col gap-6">
            {generatedAsset && (
                <ImageViewer 
                    key={generatedAsset.title} 
                    title={generatedAsset.title} 
                    imageUrl={generatedAsset.imageUrl} 
                    onDownload={() => handleDownloadImage(generatedAsset.imageUrl, generatedAsset.title)}
                />
            )}
            {analysisText && (
                <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-white">Analysis Report</h3>
                        <button onClick={handleDownloadMarkdown} className="text-sm py-1 px-3 bg-gray-700 hover:bg-gray-600 rounded-md">Download .md</button>
                    </div>
                    <div className="text-gray-300 prose prose-invert max-w-none whitespace-pre-wrap">{analysisText}</div>
                </div>
            )}
        </div>
      ) : !isLoading && Object.keys(generationProgress).length === 0 ? (
         <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 pt-10">
            <p className="text-lg">Your aerial view and analysis will appear here.</p>
        </div>
      ) : null}
    </div>
  );
};