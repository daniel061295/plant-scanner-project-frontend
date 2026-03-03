"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { scanPlantAction } from "../../infrastructure/actions/plantScan";
import { IconX, IconZoomCheck, IconBulb, IconCamera, IconArrowRight, IconPhoto, IconDeviceComputerCamera } from '@tabler/icons-react';
import PlantTip from "@/features/shared/presentation/components/PlantTip";

// Utility to compress image natively before upload
const compressImage = async (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height *= maxWidth / width));
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width *= maxHeight / height));
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    resolve(file); // Fallback to original if canvas fails
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const newFile = new File([blob], file.name, {
                                type: "image/jpeg",
                                lastModified: Date.now(),
                            });
                            resolve(newFile);
                        } else {
                            resolve(file); // Fallback
                        }
                    },
                    "image/jpeg",
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export default function PlantUploader() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isScanning, setIsScanning] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    // Stop all media tracks safely
    const stopCamera = (mediaStream = stream) => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraOpen(false);
    };

    const handleCaptureClick = async () => {
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            setIsCameraOpen(true);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access denied or unavailable", err);
            // Fallback to native input if permissions fail or on unsupported devices
            fileInputRef.current?.click();
        }
    };

    // Auto-launch camera if guided by URL param
    useEffect(() => {
        if (searchParams.get('action') === 'camera') {
            handleCaptureClick();
        }

        // Cleanup on unmount
        return () => stopCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Attach stream to video tag whenever it becomes available
    useEffect(() => {
        if (isCameraOpen && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [isCameraOpen, stream]);

    const handleGalleryClick = () => {
        galleryInputRef.current?.click();
    };

    const handleCancel = () => {
        setIsScanning(false);
        setImagePreviewUrl(null);
        setProgress(0);
    };

    // Fake progress simulation
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isScanning) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 95) return 95; // Stop at 95 until real request finishes
                    return prev + Math.floor(Math.random() * 15);
                });
            }, 800);
        }
        return () => clearInterval(interval);
    }, [isScanning]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processAndUploadImage(file);
    };

    const captureFromVideo = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match video feed natively
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
                    stopCamera();
                    await processAndUploadImage(file);
                }
            }, "image/jpeg", 0.9);
        }
    };

    const processAndUploadImage = async (file: File) => {
        setImagePreviewUrl(URL.createObjectURL(file));
        setIsScanning(true);
        setError(null);
        setProgress(0);

        try {
            // Compress the image before uploading to speed up everything
            const compressedFile = await compressImage(file);

            const formData = new FormData();
            formData.append("photo", compressedFile);

            const result = await scanPlantAction(formData);

            if (result.success && result.data) {
                setProgress(100);
                sessionStorage.setItem('lastScanResult', JSON.stringify(result.data));
                // Small delay to let progress bar hit 100% visually before navigating
                setTimeout(() => router.push(`/results/${result.data.id}`), 500);
            } else {
                setError(result.error || "Failed to scan plant");
                setIsScanning(false);
                setImagePreviewUrl(null);
            }
        } catch (err) {
            console.error(err);
            setError("Error processing image before upload.");
            setIsScanning(false);
            setImagePreviewUrl(null);
        }
    };

    return (
        <div className="flex justify-center w-full">
            {isScanning ? (
                <div className="fixed inset-0 z-[100] bg-[#f6f8f6] flex flex-col font-['Lexend',sans-serif]">
                    {/* Top App Bar */}
                    <div className="flex items-center justify-between p-4 z-20">
                        <button className="bg-transparent border-none rounded-full w-10 h-10 flex items-center justify-center text-slate-900 cursor-pointer transition-colors duration-200 hover:bg-slate-200" onClick={handleCancel}>
                            <IconX size={24} stroke={1.5} />
                        </button>
                        <div className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-xs font-medium text-slate-600 border border-slate-100 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">Processing</div>
                        <div style={{ width: "40px" }}></div>
                    </div>

                    {/* Main Animating Area */}
                    <div className="flex-1 flex flex-col items-center justify-center px-6 w-full relative">
                        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                            <div className="absolute inset-0 bg-[#13ec4933] rounded-full blur-3xl scale-75 animate-pulse origin-center"></div>
                            <div className="absolute inset-0 border border-[#13ec4933] rounded-full opacity-50"></div>
                            <div className="absolute inset-0 border border-dashed border-[#13ec494d] rounded-full opacity-60 scale-[0.85] animate-[spin_10s_linear_infinite]"></div>

                            <div className="relative w-40 h-40 bg-white rounded-full shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden border-4 border-white z-10">
                                {imagePreviewUrl && (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center opacity-80"
                                        style={{ backgroundImage: `url(${imagePreviewUrl})` }}
                                    />
                                )}
                                <div className="absolute top-0 w-full h-1 bg-[#13ec49cc] shadow-[0_0_15px_rgba(19,236,73,0.8)] animate-scan z-20"></div>
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-30">
                                    <IconZoomCheck size={48} stroke={1.5} className="text-white drop-shadow-md" />
                                </div>
                            </div>
                        </div>

                        <div className="text-center z-10 max-w-xs">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 m-0 mb-2">Just a moment...</h1>
                            <p className="text-lg text-slate-600 m-0 mb-2">Our AI is analyzing your plant&apos;s health.</p>
                            <div className="h-6 overflow-hidden relative">
                                <p className="text-[#13ec49] text-sm font-medium m-0 animate-pulse">Scanning leaves for discoloration...</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Progress Area */}
                    <div className="w-full bg-white rounded-t-[1.5rem] p-6 pb-10 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
                        <div className="flex justify-between items-end mb-2 px-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Analysis Progress</span>
                            <span className="text-2xl font-bold text-slate-900">
                                {progress}<span className="text-base align-top text-[#13ec49]">%</span>
                            </span>
                        </div>

                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#13ec49] rounded-full relative overflow-hidden transition-[width] duration-300 ease-out" style={{ width: `${progress}%` }}>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <PlantTip />
                        </div>

                        <button className="mt-4 w-full p-3 bg-transparent border-none text-slate-400 text-sm font-medium cursor-pointer transition-colors duration-200 font-inherit hover:text-slate-600" onClick={handleCancel}>
                            Cancel Analysis
                        </button>
                    </div>
                </div>
            ) : isCameraOpen ? (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col font-['Lexend',sans-serif]">
                    {/* Camera App Bar */}
                    <div className="absolute top-0 w-full flex items-center justify-between p-4 z-20 bg-gradient-to-b from-black/60 to-transparent">
                        <button className="bg-black/40 backdrop-blur-md border-none rounded-full w-10 h-10 flex items-center justify-center text-white cursor-pointer transition-colors duration-200 hover:bg-black/60" onClick={() => stopCamera()}>
                            <IconX size={24} stroke={1.5} />
                        </button>
                    </div>

                    {/* Live Video Feed */}
                    <div className="flex-1 w-full bg-black relative flex items-center justify-center overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {/* Hide canvas, used only for taking the snapshot */}
                        <canvas ref={canvasRef} className="hidden"></canvas>

                        {/* Overlay Targeting Frame */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-white/40 rounded-3xl relative">
                                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-3xl"></div>
                                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-3xl"></div>
                                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-3xl"></div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-3xl"></div>
                            </div>
                        </div>
                    </div>

                    {/* Camera Controls Area */}
                    <div className="w-full bg-black/80 backdrop-blur-lg pb-safe z-20 flex flex-col items-center pt-6 pb-12 gap-2">
                        <p className="text-white/80 text-sm mb-4 font-medium">Position the plant within the frame</p>
                        <button
                            className="w-20 h-20 rounded-full border-4 border-white border-solid bg-transparent flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                            onClick={captureFromVideo}
                        >
                            <div className="w-16 h-16 rounded-full bg-white transition-all transform hover:scale-95"></div>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative w-full overflow-hidden rounded-[1.5rem] bg-white p-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] border border-slate-100">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#13ec491a] blur-[24px]"></div>
                    <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-[#13ec490d] blur-[16px]"></div>

                    <div className="relative z-10 flex flex-col gap-4">
                        {/* Scan Plant (Camera) */}
                        <button className="relative w-full flex items-center justify-center gap-3 rounded-2xl bg-[#0d3512] p-[1.25rem_1.5rem] shadow-[0_10px_15px_-3px_rgba(17,212,66,0.1)] transition-all duration-200 border-none cursor-pointer text-white group hover:bg-[#0a2b0e] active:scale-[0.98]" onClick={handleCaptureClick}>
                            <IconCamera size={30} stroke={1.5} />
                            <span className="text-[1.125rem] font-bold text-white">Scan Plant</span>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                <IconArrowRight size={24} stroke={1.5} />
                            </div>
                        </button>

                        {/* Upload from Gallery */}
                        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-transparent p-4 transition-colors duration-200 cursor-pointer hover:bg-slate-50 active:bg-slate-100" onClick={handleGalleryClick}>
                            <IconPhoto size={24} stroke={1.5} className="text-slate-500" />
                            <span className="text-base font-semibold text-slate-600">Upload from Gallery</span>
                        </button>
                    </div>

                    {/* Hidden Inputs */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm leading-relaxed font-medium text-center shadow-sm">
                            {error}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
