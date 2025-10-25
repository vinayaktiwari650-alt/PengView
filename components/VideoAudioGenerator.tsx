import React, { useState } from 'react';
import { Spinner } from './Spinner';
// FIX: Import newly created functions from geminiService.
import { generateVideoFromImage, generateArchitecturalImage, generateDescriptionForNarration, generateSpeechFromText } from '../services/geminiService';
import type { ImageFile } from '../types';
import { fileToGenerativePart } from '../utils/fileUtils';
import { decode } from '../utils/audioUtils';

interface VideoAudioGeneratorProps {
    image: ImageFile;
}

export const VideoAudioGenerator: React.FC<VideoAudioGeneratorProps> = ({ image }) => {
    const [videoPrompt, setVideoPrompt] = useState('Animate this photo from day to night, with clouds moving in the sky.');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [videoResult, setVideoResult] = useState<string | null>(null);
    const [videoLoading, setVideoLoading] = useState(false);
    const [videoProgress, setVideoProgress] = useState('');
    const [videoError, setVideoError] = useState<string | null>(null);
    
    const [aerialImage, setAerialImage] = useState<string | null>(null);
    const [narration, setNarration] = useState<string | null>(null);
    const [audioResult, setAudioResult] = useState<string | null>(null);
    const [audioLoading, setAudioLoading] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    
    const handleGenerateVideo = async () => {
        setVideoLoading(true);
        setVideoError(null);
        setVideoResult(null);
        setVideoProgress('');
        try {
            const imagePart = await fileToGenerativePart(image.dataUrl, image.type);
            const resultUrl = await generateVideoFromImage(imagePart, videoPrompt, aspectRatio, setVideoProgress);
            setVideoResult(resultUrl);
        } catch (err) {
            // FIX: The error handling logic was already correct, removing the now-obsolete FIX comment.
            setVideoError(err instanceof Error ? err.message : String(err));
        } finally {
            setVideoLoading(false);
            setVideoProgress('');
        }
    };
    
    const handleGenerateNarration = async () => {
        setAudioLoading(true);
        setAudioError(null);
        setAerialImage(null);
        setNarration(null);
        setAudioResult(null);
        try {
            const imagePart = await fileToGenerativePart(image.dataUrl, image.type);
            
            // 1. Generate Aerial Image
            const aerialImageUrl = await generateArchitecturalImage(imagePart, "Generate a photorealistic aerial view of this building.");
            setAerialImage(aerialImageUrl);
            
            // 2. Generate Description from Aerial Image
            const aerialImagePart = await fileToGenerativePart(aerialImageUrl, 'image/png');
            const description = await generateDescriptionForNarration(aerialImagePart);
            setNarration(description);
            
            // 3. Generate Speech
            const base64Audio = await generateSpeechFromText(description);
            // FIX: The API returns raw PCM data. While not perfectly standard, 'audio/wav' is a better MIME type hint for browsers than 'audio/webm' when creating a Blob from raw audio data.
            // This change aligns with simplifying audio handling.
            const audioBlob = new Blob([decode(base64Audio)], { type: 'audio/wav' });
            setAudioResult(URL.createObjectURL(audioBlob));

        } catch (err) {
            // FIX: The error handling logic was already correct, removing the now-obsolete FIX comment.
            setAudioError(err instanceof Error ? err.message : String(err));
        } finally {
            setAudioLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Video Section */}
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-cyan-400">Video Generation (Veo)</h2>
                <p className="text-sm text-gray-400">Create a short video animation based on your image.</p>
                
                <div>
                    <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-300 mb-1">Prompt</label>
                    <textarea id="video-prompt" value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Aspect Ratio</label>
                    <div className="flex gap-2">
                        {(['16:9', '9:16'] as const).map(ratio => (
                            <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-4 py-2 text-sm rounded-md transition-colors ${aspectRatio === ratio ? 'bg-cyan-600 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>{ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}</button>
                        ))}
                    </div>
                </div>

                <button onClick={handleGenerateVideo} disabled={videoLoading} className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
                    {videoLoading ? <Spinner/> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /><path d="M14.553 5.106A1 1 0 0116 6v8a1 1 0 01-1.447.894l-3-2A1 1 0 0111 12V8a1 1 0 01.553-.894l3-2z" /></svg>}
                    {videoLoading ? 'Generating...' : 'Generate Video'}
                </button>

                {videoLoading && <p className="text-sm text-center text-cyan-300 animate-pulse">{videoProgress || 'Initializing...'}</p>}
                {videoError && <p className="text-sm text-center text-red-400 p-2 bg-red-900/50 rounded-md">{videoError}</p>}
                {videoResult && <video src={videoResult} controls className="w-full rounded-lg mt-2" />}
            </div>

            <hr className="border-gray-700" />
            
            {/* Audio Section */}
            <div className="flex flex-col gap-4">
                 <h2 className="text-2xl font-bold text-cyan-400">AI Narration</h2>
                <p className="text-sm text-gray-400">Generate an aerial view of your building, then create a descriptive audio narration for it.</p>
                <button onClick={handleGenerateNarration} disabled={audioLoading} className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
                    {audioLoading ? <Spinner/> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 3.636a1 1 0 011.414 0A7 7 0 0112 5v2.515a4.5 4.5 0 01-4.5 4.5A4.5 4.5 0 013 7.515V5a7 7 0 012.05-1.364zM2 7.515a5 5 0 014.545-4.95A9 9 0 0112 3v4.515a2.5 2.5 0 01-2.5 2.5A2.5 2.5 0 017 7.515V3.05a9 9 0 01-4.95 1.405A5 5 0 012 7.515zm11 .5a.5.5 0 01.5.5v2.5a.5.5 0 01-1 0V8.5a.5.5 0 01.5-.5z" clipRule="evenodd" /><path d="M14 8a1 1 0 00-1 1v2.5a1 1 0 002 0V9a1 1 0 00-1-1z" /></svg>}
                    {audioLoading ? 'Generating...' : 'Analyze and Narrate'}
                </button>
                 {audioError && <p className="text-sm text-center text-red-400 p-2 bg-red-900/50 rounded-md">{audioError}</p>}
                 {audioLoading && <p className="text-sm text-center text-cyan-300 animate-pulse">Generating narration step-by-step...</p>}

                {(aerialImage || narration || audioResult) && (
                    <div className="mt-4 p-4 bg-gray-900/50 rounded-lg flex flex-col gap-4">
                        {aerialImage && <img src={aerialImage} alt="Generated aerial view" className="w-full rounded-md" />}
                        {narration && <p className="text-sm italic text-gray-300 bg-gray-700/50 p-3 rounded-md">"{narration}"</p>}
                        {audioResult && <audio src={audioResult} controls className="w-full" />}
                    </div>
                )}
            </div>
        </div>
    );
};