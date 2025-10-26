import React, { useState, useCallback } from 'react';
import { ImageViewer } from './ImageViewer';
import { Spinner } from './Spinner';
// FIX: Import generateMultiViewNarrationScript and generateSpeechFromText
import { generateArchitecturalImage, generateMultiViewNarrationScript, generateSpeechFromText } from '../services/geminiService';
// FIX: Import NarratorData type.
import type { ImageFile, NarratorData } from '../types';
import { fileToGenerativePart } from '../utils/fileUtils';
// FIX: Removed unused decodeAudioData import.
import { decode } from '../utils/audioUtils';
import * as JSZip from 'jszip';

const NARRATION_VIEWS = [
  { title: 'Aerial View', prompt: "Create a photorealistic image showing an aerial drone view of this building and its surroundings." },
  { title: 'Side View', prompt: "Create a photorealistic image showing a side profile of this building from street level." },
  { title: "Ant's Eye View", prompt: "Create a dramatic, low-angle, ant's eye perspective looking up at this building's facade." },
  { title: 'Interior View', prompt: "Create a photorealistic image imagining the main interior space of this building, focusing on light and atmosphere." },
];

const NARRATION_STAGES = [...NARRATION_VIEWS.map(v => v.title), 'Narration Script', 'Audio Generation'];

interface AiNarratorProps {
    image: ImageFile;
    narratorData: NarratorData | null;
    // FIX: Update prop type to allow functional updates for state.
    setNarratorData: React.Dispatch<React.SetStateAction<NarratorData | null>>;
}

export const AiNarrator: React.FC<AiNarratorProps> = ({ image, narratorData, setNarratorData }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generatedViews = narratorData?.views || [];
  const narrationScript = narratorData?.script || null;
  const audioUrl = narratorData?.audioUrl || null;
  const generationProgress = narratorData?.progress || {};

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const initialProgress = NARRATION_STAGES.reduce((acc, stage) => {
        acc[stage] = 'loading';
        return acc;
    }, {} as NarratorData['progress']);
    setNarratorData({ views: [], script: null, audioUrl: null, progress: initialProgress });

    try {
      const imagePart = await fileToGenerativePart(image.dataUrl, image.type);

      // 1. Generate all views sequentially
      for (const view of NARRATION_VIEWS) {
        try {
          const result = await generateArchitecturalImage(imagePart, view.prompt);
          setNarratorData(prev => ({ 
              ...prev!, 
              views: [...prev!.views, { title: view.title, imageUrl: result }],
              progress: { ...prev!.progress, [view.title]: 'success' } 
          }));
        } catch (err) {
          console.error(`Failed to generate ${view.title}:`, err);
          setNarratorData(prev => ({ ...prev!, progress: { ...prev!.progress, [view.title]: 'error' } }));
          throw new Error(`Failed to generate view: ${view.title}`);
        }
      }
      
      // 2. Generate Narration Script
      let finalScript = '';
      try {
        const script = await generateMultiViewNarrationScript(imagePart);
        finalScript = script;
        setNarratorData(prev => ({ ...prev!, script: script, progress: { ...prev!.progress, 'Narration Script': 'success' } }));
      } catch(err) {
        setNarratorData(prev => ({ ...prev!, progress: { ...prev!.progress, 'Narration Script': 'error' } }));
        throw new Error('Failed to generate narration script.');
      }

      // 3. Generate Audio
      if (finalScript) {
        try {
          const base64Audio = await generateSpeechFromText(finalScript);
          // FIX: Removed unnecessary AudioContext creation to simplify audio Blob handling.
          // FIX: The API returns raw PCM data. While not perfectly standard, 'audio/wav' is a better MIME type hint for browsers than 'audio/webm'.
          const audioBlob = new Blob([decode(base64Audio)], { type: 'audio/wav' });
          const newAudioUrl = URL.createObjectURL(audioBlob);
          setNarratorData(prev => ({ ...prev!, audioUrl: newAudioUrl, progress: { ...prev!.progress, 'Audio Generation': 'success' } }));
        } catch(err) {
            setNarratorData(prev => ({ ...prev!, progress: { ...prev!.progress, 'Audio Generation': 'error' } }));
            throw new Error('Failed to generate audio file.');
        }
      } else {
        setNarratorData(prev => ({...prev!, progress: {...prev!.progress, 'Audio Generation': 'error'}}));
        throw new Error('Narration script was empty, could not generate audio.');
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [image, setNarratorData]);
  
  const handleDownloadAllViews = async () => {
    if (generatedViews.length === 0) return;

    const zip = new (JSZip as any)();
    
    const imagePromises = generatedViews.map(async (asset) => {
      const response = await fetch(asset.imageUrl);
      const blob = await response.blob();
      const filename = `${asset.title.replace(/\s+/g, '_')}.png`;
      zip.file(filename, blob);
    });

    await Promise.all(imagePromises);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = 'PengVision_Views.zip';
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
       <h2 className="text-2xl font-bold text-white">AI Narrator & Views</h2>
       <p className="text-sm text-gray-400">Generate multiple artistic views of your building, then create a descriptive audio narration for them.</p>
       <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full py-2 px-4 bg-white hover:bg-gray-200 disabled:bg-gray-500 text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
       >
        {isLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 3.636a1 1 0 011.414 0A7 7 0 0112 5v2.515a4.5 4.5 0 01-4.5 4.5A4.5 4.5 0 013 7.515V5a7 7 0 012.05-1.364zM2 7.515a5 5 0 014.545-4.95A9 9 0 0112 3v4.515a2.5 2.5 0 01-2.5 2.5A2.5 2.5 0 017 7.515V3.05a9 9 0 01-4.95 1.405A5 5 0 012 7.515zm11 .5a.5.5 0 01.5.5v2.5a.5.5 0 01-1 0V8.5a.5.5 0 01.5-.5z" clipRule="evenodd" /><path d="M14 8a1 1 0 00-1 1v2.5a1 1 0 002 0V9a1 1 0 00-1-1z" /></svg>}
        {isLoading ? 'Generating...' : 'Generate Views & Narration'}
       </button>

      {error && <p className="text-sm text-center text-red-400 p-2 bg-red-900/50 rounded-md">{error}</p>}

      {Object.keys(generationProgress).length > 0 && (
          <div className="flex flex-col gap-2 p-4 bg-black/50 border border-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-center mb-2 text-white">{isLoading ? 'Generation in Progress...' : 'Generation Complete'}</h3>
              {NARRATION_STAGES.map(stage => (
                  <div key={stage} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg text-sm">
                      <span>{stage}</span>
                      {generationProgress[stage] && <ProgressIcon status={generationProgress[stage]} />}
                  </div>
              ))}
          </div>
      )}
      
      {(generatedViews.length > 0 || audioUrl) ? (
        <div className="mt-4 flex flex-col gap-6">
            {narrationScript && <p className="text-sm italic text-gray-300 bg-gray-800/50 p-3 rounded-md border border-gray-700">"{narrationScript}"</p>}
            {audioUrl && <audio src={audioUrl} controls className="w-full" />}
            {generatedViews.length > 0 && !isLoading && (
                  <button 
                      onClick={handleDownloadAllViews}
                      className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download All Views as .zip
                  </button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              {NARRATION_VIEWS
                  .map(p => generatedViews.find(a => a.title === p.title))
                  .filter(Boolean)
                  .map((view) => view && (
                      <ImageViewer key={view.title} title={view.title} imageUrl={view.imageUrl} />
                  ))
              }
            </div>
        </div>
      ) : !isLoading && Object.keys(generationProgress).length === 0 ? (
         <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 pt-10">
            <p className="text-lg">Your generated views and narration will appear here.</p>
        </div>
      ) : null}
    </div>
  );
};