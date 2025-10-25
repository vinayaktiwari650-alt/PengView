import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveSession, Modality, Blob, LiveServerMessage } from '@google/genai';
import { encode } from '../utils/audioUtils';
import { Spinner } from './Spinner';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

export const AudioTranscriber: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startTranscription = async () => {
        if (isRecording) return;
        
        setIsRecording(true);
        setError(null);
        setTranscription('');

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            const ai = new GoogleGenAI({ apiKey: API_KEY });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        // FIX: Cast window to any to allow for vendor-prefixed webkitAudioContext
                        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current!);
                        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current.destination);
                    },
                    onmessage: (message: LiveServerMessage) => {
                        const text = message.serverContent?.inputTranscription?.text;
                        if (text) {
                            setTranscription(prev => prev + text);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        setError(`Connection error: ${e.message}`);
                        stopTranscription();
                    },
                    onclose: () => {
                        // Connection closed
                    },
                },
                config: {
                    inputAudioTranscription: {},
                    responseModalities: [Modality.AUDIO], // Required but not used for transcription only
                },
            });
        } catch (err) {
            setError('Failed to start transcription. Please ensure microphone permissions are granted.');
            setIsRecording(false);
        }
    };
    
    const stopTranscription = () => {
        if (!isRecording && !streamRef.current) return;
        
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;

        mediaStreamSourceRef.current?.disconnect();
        mediaStreamSourceRef.current = null;

        audioContextRef.current?.close();
        audioContextRef.current = null;
        
        setIsRecording(false);
    };

    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            stopTranscription();
        };
    }, []);

    const createBlob = (data: Float32Array): Blob => {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    }

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-cyan-400">Live Audio Transcription</h2>
            <p className="text-sm text-gray-400">
                Click "Start Transcription" and speak into your microphone. The app will transcribe your speech in real-time.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={startTranscription}
                    disabled={isRecording}
                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" /></svg>
                    Start Transcription
                </button>
                <button
                    onClick={stopTranscription}
                    disabled={!isRecording}
                    className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    Stop Transcription
                </button>
            </div>

            {error && <p className="text-sm text-center text-red-400 p-2 bg-red-900/50 rounded-md">{error}</p>}

            <div className="w-full min-h-[200px] bg-gray-900/50 p-4 rounded-md mt-4">
                <p className="text-gray-300 whitespace-pre-wrap">{transcription}</p>
                {isRecording && <Spinner />}
                {!isRecording && transcription === '' && <p className="text-gray-500">Your transcribed text will appear here...</p>}
            </div>
        </div>
    );
};