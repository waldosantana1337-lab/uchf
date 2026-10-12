import { useState, useRef, useEffect, useCallback } from 'react';
// Fix: Remove non-existent LiveSession export from @google/genai
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import type { Recipe, ChefPersonality } from '../types';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';

interface UseSousChefProps {
    recipe: Recipe;
    personality: ChefPersonality;
    onExit: () => void;
}

const getChefConfig = (personality: ChefPersonality, recipe: Recipe) => {
    switch (personality) {
        case 'pierre':
            return {
                voiceName: 'Puck',
                systemInstruction: `You are 'Chef Pierre', a witty French gourmand. The user is cooking "${recipe.recipeName}". Answer questions about the recipe or general cooking. Be sophisticated and a bit sassy. For commands like 'next' or 'exit', just give a simple confirmation.`
            };
        case 'sarge':
            return {
                voiceName: 'Fenrir',
                systemInstruction: `You are 'Sarge', a drill sergeant chef. The user is cooking "${recipe.recipeName}". Your mission is to provide clear, direct answers. No fluff. If they ask for the next step, you say "Affirmative, next step." That's it. Move!`
            };
        case 'nonna':
            return {
                voiceName: 'Kore',
                systemInstruction: `You are 'Nonna', a warm Italian grandmother. The user is making your special "${recipe.recipeName}". Answer their questions with love and patience, my dear. If they need the next step, you just say "Of course, next step, tesoro."`
            };
        case 'zephyr':
        default:
            return {
                voiceName: 'Zephyr',
                systemInstruction: `You are 'Zephyr', a friendly cooking assistant for the recipe: "${recipe.recipeName}". Your role is to answer questions about this recipe or general cooking. Keep responses concise. For navigation commands like 'next' or 'exit', provide a simple confirmation like "Okay, next step."`
            };
    }
};

export const useSousChef = ({ recipe, personality, onExit }: UseSousChefProps) => {
    const [isListening, setIsListening] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [modelResponse, setModelResponse] = useState('');
    
    const aiRef = useRef<GoogleGenAI | null>(null);
    // Fix: Use any for sessionRef as LiveSession is not exported
    const sessionRef = useRef<any | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const outputGainNodeRef = useRef<GainNode | null>(null);
    const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
    const nextStartTimeRef = useRef(0);

    const cleanup = useCallback(() => {
        if (sessionRef.current) {
            try { sessionRef.current.close(); } catch(e) {}
            sessionRef.current = null;
        }
        if (scriptProcessorRef.current) {
            try { scriptProcessorRef.current.disconnect(); } catch(e) {}
            scriptProcessorRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            try { audioContextRef.current.close(); } catch(e) {}
            audioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            try { outputAudioContextRef.current.close(); } catch(e) {}
            outputAudioContextRef.current = null;
        }
        audioQueueRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
        audioQueueRef.current = [];
        
        setIsListening(false);
        setIsAudioPlaying(false);
    }, []);

    const playAudio = async (base64Audio: string) => {
        if (!outputAudioContextRef.current || !outputGainNodeRef.current || outputAudioContextRef.current.state === 'closed') return;
        setIsAudioPlaying(true);
        try {
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContextRef.current,
                24000,
                1
            );
            
            const source = outputAudioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputGainNodeRef.current);
            
            const currentTime = outputAudioContextRef.current.currentTime;
            const startTime = Math.max(currentTime, nextStartTimeRef.current);
            
            source.start(startTime);
            nextStartTimeRef.current = startTime + audioBuffer.duration;
            audioQueueRef.current.push(source);
            
            source.onended = () => {
                audioQueueRef.current = audioQueueRef.current.filter(s => s !== source);
                if (audioQueueRef.current.length === 0) {
                    setIsAudioPlaying(false);
                }
            };
        } catch (error) {
            console.error("Error playing audio:", error);
            setIsAudioPlaying(false);
        }
    };

    const startSession = useCallback(async () => {
        if (!aiRef.current || isListening) return;
        
        try {
            setIsListening(true);
            setTranscript('');
            setModelResponse('');
            
            if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                outputGainNodeRef.current = outputAudioContextRef.current.createGain();
                outputGainNodeRef.current.connect(outputAudioContextRef.current.destination);
            }
            
            if (outputAudioContextRef.current.state === 'suspended') {
                await outputAudioContextRef.current.resume();
            }
            
            nextStartTimeRef.current = 0;
            const chefConfig = getChefConfig(personality, recipe);

            const sessionPromise = aiRef.current.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: async () => {
                        try {
                            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                            }
                            
                            const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                            scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                            
                            scriptProcessorRef.current.onaudioprocess = (event) => {
                                const inputData = event.inputBuffer.getChannelData(0);
                                const pcmBlob: Blob = {
                                    data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                    mimeType: 'audio/pcm;rate=16000',
                                };
                                sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                            };
                            
                            source.connect(scriptProcessorRef.current);
                            scriptProcessorRef.current.connect(audioContextRef.current.destination);
                        } catch (err) {
                            console.error("Microphone access failed:", err);
                            cleanup();
                        }
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setTranscript(prev => prev + message.serverContent.inputTranscription.text);
                        }
                        if (message.serverContent?.outputTranscription) {
                            setModelResponse(prev => prev + message.serverContent.outputTranscription.text);
                        }
                        const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audio) {
                            playAudio(audio);
                        }
                    },
                    onclose: () => cleanup(),
                    onerror: () => cleanup(),
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: chefConfig.voiceName } } },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: chefConfig.systemInstruction,
                },
            });
            
            sessionRef.current = await sessionPromise;
        } catch (e) {
            console.error("Session start failed:", e);
            cleanup();
        }
    }, [isListening, personality, cleanup, recipe]);

    const stopSession = () => cleanup();

    const toggleListening = () => {
        if (isListening) stopSession();
        else startSession();
    };

    useEffect(() => {
        if (!aiRef.current) {
            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        }
        return () => cleanup();
    }, [cleanup]);

    return {
        isListening,
        toggleListening,
        transcript,
        isAudioPlaying,
        modelResponse,
    };
};