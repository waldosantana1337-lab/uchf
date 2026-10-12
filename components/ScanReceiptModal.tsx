import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from './common/Modal';
import { useToast } from '../contexts/ToastContext';
import { identifyReceiptItems } from '../services/geminiService';
import { Loader } from './Loader';
import { useAppContext } from '../contexts/AppContext';
import { resizeImageFile } from '../utils/imageUtils';

interface ScanReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ScannedItem {
    name: string;
    quantity: string;
    expiresInDays: number;
    checked: boolean;
    expiresOnDate: string; // YYYY-MM-DD
}

const SCAN_STEPS = [
    "Uploading receipt image...",
    "Scanning line items & quantities...",
    "Standardizing ingredient names...",
    "Calculating predictive food shelf-lives..."
];

const ScanReceiptModal: React.FC<ScanReceiptModalProps> = ({ isOpen, onClose }) => {
    const { userProfile, handleUpdateProfile, currentUser, setIngredients } = useAppContext();
    const { showToast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

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
                setError("Could not access the camera. Please upload an image instead.");
                setIsCameraActive(false);
            }
        } else {
            setError("Your browser does not support camera access. Please upload an image.");
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setCapturedImage(null);
            setScannedItems([]);
            setError(null);
            setIsCameraActive(false);
            setLoadingStep(0);
        } else {
            stopCamera();
        }
        return () => {
            stopCamera();
        };
    }, [isOpen, stopCamera]);

    // Animate scanning progress steps
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingStep((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
            }, 1800);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

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

    const handleScanImage = async (imageDataUrl: string) => {
        setIsLoading(true);
        setLoadingStep(0);
        setError(null);
        try {
            const items = await identifyReceiptItems(imageDataUrl);
            
            // Format scanned items to include checklist state and computed expiration date
            const formatted = items.map(item => {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + item.expiresInDays);
                const yyyy = expiryDate.getFullYear();
                const mm = String(expiryDate.getMonth() + 1).padStart(2, '0');
                const dd = String(expiryDate.getDate()).padStart(2, '0');
                return {
                    ...item,
                    checked: true,
                    expiresOnDate: `${yyyy}-${mm}-${dd}`
                };
            });
            
            setScannedItems(formatted);
        } catch (e: any) {
            console.error("Receipt parse error:", e);
            setError(e.message || "Failed to scan receipt. Please ensure it is a legible image of a grocery receipt.");
            setCapturedImage(null);
        } finally {
            setIsLoading(false);
        }
    };

    const processFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError("Invalid file type. Please upload an image of a receipt.");
            return;
        }

        try {
            setError(null);
            const dataUrl = await resizeImageFile(file, 1600, 0.85);
            setCapturedImage(dataUrl);
            handleScanImage(dataUrl);
        } catch (err: any) {
            console.error("Error preparing receipt image:", err);
            setError("Failed to read the image. Please try a different photo.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const toggleItemCheck = (index: number) => {
        setScannedItems(prev => prev.map((item, idx) => idx === index ? { ...item, checked: !item.checked } : item));
    };

    const updateItemName = (index: number, newName: string) => {
        setScannedItems(prev => prev.map((item, idx) => idx === index ? { ...item, name: newName } : item));
    };

    const updateItemDate = (index: number, newDate: string) => {
        setScannedItems(prev => prev.map((item, idx) => idx === index ? { ...item, expiresOnDate: newDate } : item));
    };

    const allChecked = scannedItems.length > 0 && scannedItems.every(item => item.checked);

    const toggleAll = () => {
        const nextVal = !allChecked;
        setScannedItems(prev => prev.map(item => ({ ...item, checked: nextVal })));
    };

    const handleCookWithScannedItems = () => {
        const checkedItems = scannedItems.filter(item => item.checked && item.name.trim());
        if (checkedItems.length === 0) {
            showToast("Please check at least one ingredient to cook with.", "info");
            return;
        }

        const names = checkedItems.map(item => item.name.toLowerCase().trim());
        setIngredients(prev => Array.from(new Set([...prev, ...names])));
        showToast(`Added ${checkedItems.length} ingredients from your receipt! Ready to get recipes.`, "success");
        onClose();
    };

    const handleAddToPantry = () => {
        const checkedItems = scannedItems.filter(item => item.checked && item.name.trim());
        if (checkedItems.length === 0) {
            showToast("Please check at least one ingredient to add.", "info");
            return;
        }

        if (userProfile) {
            const currentPantry = userProfile.pantry || [];
            const updatedPantry = [...currentPantry];

            checkedItems.forEach(item => {
                const existingIdx = updatedPantry.findIndex(p => p.name.toLowerCase() === item.name.toLowerCase().trim());
                if (existingIdx !== -1) {
                    // Update existing item status and expiration date
                    updatedPantry[existingIdx] = {
                        ...updatedPantry[existingIdx],
                        inStock: true,
                        expiresOn: item.expiresOnDate
                    };
                } else {
                    // Add new item
                    updatedPantry.push({
                        name: item.name.toLowerCase().trim(),
                        inStock: true,
                        expiresOn: item.expiresOnDate
                    });
                }
            });

            // Add 100 XP to the user for scanning groceries!
            let xp = userProfile.xp || 0;
            let level = userProfile.level || 1;
            xp += 100;
            if (xp >= level * 500) {
                level += 1;
                showToast(`LEVEL UP! You are now a Level ${level} Chef!`, 'success');
            }

            handleUpdateProfile({
                pantry: updatedPantry,
                xp,
                level
            });

            showToast(`Stocked ${checkedItems.length} items in your virtual pantry! +100 XP`, "success");
        } else {
            // Guest mode: also add them to active ingredients so they are not lost!
            const names = checkedItems.map(item => item.name.toLowerCase().trim());
            setIngredients(prev => Array.from(new Set([...prev, ...names])));
            showToast(`Added ${checkedItems.length} items from your receipt to your ingredients!`, "success");
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} titleId="scan-receipt-title" className="max-w-3xl">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 id="scan-receipt-title" className="text-2xl font-black text-[#1A1A1A] tracking-tighter">AI Receipt Reader</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Populate your virtual pantry in seconds</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-2xl transition-colors">&times;</button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p>{error}</p>
                    </div>
                )}

                {/* Main Scanning state OR upload UI */}
                {!capturedImage && !isLoading && scannedItems.length === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Option 1: File upload with Drag and Drop */}
                        <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-4 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[250px] ${isDragOver ? 'border-green-500 bg-green-50/50 scale-102' : 'border-gray-200 hover:border-[#3F6112] hover:bg-gray-50/30'}`}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/*" 
                                className="hidden" 
                            />
                            <div className="h-16 w-16 bg-green-50 text-[#3F6112] rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            </div>
                            <h3 className="text-lg font-black text-[#1A1A1A] tracking-tight">Upload Receipt Photo</h3>
                            <p className="text-gray-400 font-medium text-xs mt-2 max-w-[200px]">Drag & drop or click to upload JPEG, PNG, or webp format</p>
                        </div>

                        {/* Option 2: Live Camera Capture */}
                        <div className="border-4 border-dashed border-gray-200 rounded-3xl p-4 flex flex-col items-center justify-center text-center min-h-[250px] bg-white relative overflow-hidden group hover:border-[#3F6112]">
                            {isCameraActive ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                                        <button onClick={stopCamera} className="px-4 py-2 bg-gray-800/80 text-white font-bold text-xs rounded-full hover:bg-gray-700 transition-colors">Cancel</button>
                                        <button onClick={handleCapture} className="px-6 py-2 bg-orange-500 text-white font-bold text-xs rounded-full hover:bg-orange-600 transition-colors flex items-center gap-1.5 shadow-xl">
                                            <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
                                            Capture receipt
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-4">
                                    <div className="h-16 w-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-black text-[#1A1A1A] tracking-tight">Capture with Camera</h3>
                                    <p className="text-gray-400 font-medium text-xs mt-2 max-w-[200px]">Directly photograph the receipt paper using your webcam or phone camera</p>
                                    <button onClick={startCamera} className="btn-active-scale mt-5 px-6 py-2.5 bg-orange-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-orange-600 shadow-md">
                                        Enable Camera
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Progress State */}
                {isLoading && (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <Loader />
                        <div className="mt-8 max-w-sm">
                            <h4 className="text-lg font-black text-[#1A1A1A] tracking-tight animate-pulse">Analyzing Receipt...</h4>
                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mt-2">{SCAN_STEPS[loadingStep]}</p>
                            
                            <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
                                <div 
                                    className="bg-green-600 h-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${((loadingStep + 1) / SCAN_STEPS.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ledger / Review Ledger */}
                {scannedItems.length > 0 && !isLoading && (
                    <div className="flex flex-col">
                        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl mb-4 flex items-center justify-between text-[#2D450D] text-xs font-bold uppercase tracking-wider">
                            <span>Double check and modify details before importing</span>
                            <span className="bg-[#3F6112] text-white px-2 py-0.5 rounded-full text-[10px]">+100 XP Reward</span>
                        </div>

                        <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-96 overflow-y-auto mb-6">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/80 sticky top-0 backdrop-blur-sm z-10">
                                    <tr className="border-b border-gray-100">
                                        <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest w-16 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <input 
                                                    type="checkbox" 
                                                    checked={allChecked} 
                                                    onChange={toggleAll}
                                                    title={allChecked ? "Deselect All" : "Select All"}
                                                    className="h-4 w-4 rounded border-gray-300 text-[#3F6112] focus:ring-[#3F6112] cursor-pointer"
                                                />
                                                <span className="text-[9px] font-bold text-gray-400">All</span>
                                            </div>
                                        </th>
                                        <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Ingredient Item</th>
                                        <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest w-32">Qty / Vol</th>
                                        <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest w-40">Predict Expiry</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {scannedItems.map((item, index) => (
                                        <tr key={index} className={`transition-colors hover:bg-gray-50/50 ${item.checked ? '' : 'opacity-40'}`}>
                                            <td className="p-4 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={item.checked} 
                                                    onChange={() => toggleItemCheck(index)}
                                                    className="h-5 w-5 rounded border-gray-300 text-[#3F6112] focus:ring-[#3F6112] cursor-pointer"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    type="text" 
                                                    value={item.name} 
                                                    onChange={(e) => updateItemName(index, e.target.value)}
                                                    className="w-full bg-transparent border-b border-transparent focus:border-green-400 font-bold text-[#1A1A1A] outline-none text-sm capitalize py-1"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <span className="text-gray-500 text-xs font-bold bg-gray-100 px-2.5 py-1 rounded-lg inline-block whitespace-nowrap">{item.quantity}</span>
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    type="date" 
                                                    value={item.expiresOnDate} 
                                                    onChange={(e) => updateItemDate(index, e.target.value)}
                                                    className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-600 outline-none w-full"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end items-center gap-3">
                            <button 
                                onClick={() => {
                                    setCapturedImage(null);
                                    setScannedItems([]);
                                }} 
                                className="w-full sm:w-auto px-5 py-3 border border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-50"
                            >
                                Scan Another
                            </button>
                            <button 
                                onClick={handleAddToPantry} 
                                className="w-full sm:w-auto px-5 py-3 border-2 border-[#3F6112] text-[#3F6112] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-green-50/50 transition-colors"
                            >
                                📦 Stock in Pantry
                            </button>
                            <button 
                                onClick={handleCookWithScannedItems} 
                                className="w-full sm:w-auto px-6 py-3 bg-[#3F6112] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-opacity-95 shadow-xl shadow-green-900/15 flex items-center justify-center gap-2"
                            >
                                <span>🍳 Cook with Selected</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-black">
                                    {scannedItems.filter(i => i.checked).length}
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ScanReceiptModal;
