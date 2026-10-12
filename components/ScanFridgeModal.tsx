import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './common/Modal';
import { useToast } from '../contexts/ToastContext';
import { identifyIngredientsFromImage } from '../services/geminiService';
import { Loader } from './Loader';
import { useAppContext } from '../contexts/AppContext';
import { resizeImageFile } from '../utils/imageUtils';

interface ScanFridgeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ScanFridgeModal: React.FC<ScanFridgeModalProps> = ({ isOpen, onClose }) => {
    const { handleIngredientsScanned } = useAppContext();
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [scannedIngredients, setScannedIngredients] = useState<{name: string, quantity: string}[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const { showToast } = useToast();

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    }, []);

    const startCamera = useCallback(async () => {
        setError(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                stopCamera();
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsCameraActive(true);
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Could not access the camera. Please upload a photo instead.");
                setIsCameraActive(false);
            }
        } else {
            setError("Your browser does not support camera access. Please upload a photo.");
            setIsCameraActive(false);
        }
    }, [stopCamera]);

    useEffect(() => {
        if (isOpen) {
            setCapturedImage(null);
            setScannedIngredients([]);
            setError(null);
            setIsCameraActive(false);
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [isOpen, stopCamera]);

    const handleCapture = () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                setCapturedImage(dataUrl);
                stopCamera();
                handleScanImage(dataUrl);
            }
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                setError("Please upload an image file (JPEG, PNG, WEBP).");
                return;
            }
            try {
                setError(null);
                const resized = await resizeImageFile(file, 1600, 0.85);
                setCapturedImage(resized);
                stopCamera();
                handleScanImage(resized);
            } catch (err: any) {
                setError("Failed to read the image. Please try again.");
            }
        }
    };
    
    const handleScanImage = async (imageDataUrl: string) => {
        setIsLoading(true);
        try {
            const ingredients = await identifyIngredientsFromImage(imageDataUrl);
            setScannedIngredients(ingredients || []);
            if (!ingredients || ingredients.length === 0) {
                showToast("No ingredients were detected in this image.", 'info');
            }
        } catch (e: any) {
            showToast(e.message || "Could not identify ingredients.", 'error');
            setError(e.message || "Could not identify ingredients.");
            setScannedIngredients([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setScannedIngredients([]);
        setError(null);
        startCamera();
    };

    const handleAddToList = () => {
        if (scannedIngredients && scannedIngredients.length > 0) {
            handleIngredientsScanned(scannedIngredients);
            onClose();
        } else {
            showToast("No ingredients were identified to add.", 'info');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} titleId="scan-fridge-title" className="max-w-2xl">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 id="scan-fridge-title" className="text-2xl font-black text-[#152238] tracking-tight">Scan Fridge & Pantry</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-2xl transition-colors">&times;</button>
                </div>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold text-center">
                        {error}
                    </div>
                )}

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
                
                <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden mb-4">
                    {capturedImage ? (
                        <img src={capturedImage} alt="Captured preview" className="w-full h-full object-contain" />
                    ) : isCameraActive ? (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-br from-gray-900 to-gray-800">
                            <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                            </div>
                            <p className="font-bold text-sm text-gray-200 mb-4 max-w-xs">Take a photo of your fridge shelves, pantry, or countertop produce.</p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <button onClick={startCamera} className="px-5 py-2.5 bg-green-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-green-700 shadow-lg">
                                    Open Camera
                                </button>
                                <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-white/20 border border-white/20 shadow-lg">
                                    Upload Photo
                                </button>
                            </div>
                        </div>
                    )}
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20">
                            <Loader />
                            <p className="mt-4 font-bold tracking-wide animate-pulse">Detecting Ingredients & Quantities...</p>
                        </div>
                    )}
                </div>

                {scannedIngredients && scannedIngredients.length > 0 && !isLoading && (
                     <div className="mb-4 text-center">
                        <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-2">Detected Ingredients:</h3>
                        <div className="flex flex-wrap justify-center gap-2 mt-1">
                             {scannedIngredients.map((ing, i) => (
                                <div key={i} className="px-3 py-1 bg-green-50 border border-green-200 text-[#2D450D] rounded-xl text-xs font-bold flex items-center gap-2">
                                    <span className="opacity-60">{ing.quantity}</span>
                                    <span className="capitalize">{ing.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                    {capturedImage ? (
                        <>
                            <button onClick={handleRetake} className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-gray-200">
                                Retake / Change
                            </button>
                            <button onClick={handleAddToList} disabled={!scannedIngredients || scannedIngredients.length === 0 || isLoading} className="w-full sm:w-auto px-8 py-3 bg-[#3F6112] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-95 disabled:opacity-40 shadow-xl shadow-green-900/15">
                                Add to Kitchen ({scannedIngredients.length})
                            </button>
                        </>
                    ) : isCameraActive ? (
                        <div className="flex gap-2">
                            <button onClick={stopCamera} className="px-5 py-3 bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-gray-200">
                                Cancel
                            </button>
                            <button onClick={handleCapture} className="px-8 py-3 bg-green-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-green-700 shadow-lg">
                                Take Photo
                            </button>
                            <button onClick={() => fileInputRef.current?.click()} className="px-5 py-3 border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-gray-50">
                                Upload Instead
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
};

export default ScanFridgeModal;