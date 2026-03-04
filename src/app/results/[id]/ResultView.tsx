"use client";

import { useEffect, useState } from "react";
import { IconFileBroken, IconScan, IconArrowRight } from "@tabler/icons-react";
import PlantTip from "@/features/shared/presentation/components/PlantTip";
import { PlantScanResult } from "@/features/plants/domain/entities/PlantScanResult";
import BackButton from "./BackButton";
import Link from "next/link";
import Image from "next/image";

export default function ResultView({ serverResult, scanId }: { serverResult: PlantScanResult | null, scanId: string }) {
    const [result, setResult] = useState<PlantScanResult | null>(serverResult);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Try getting it from sessionStorage for immediate new scans to avoid cache delays
        const stored = sessionStorage.getItem('lastScanResult');
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as PlantScanResult;
                // If it matches the ID we are looking for, or if it's recent
                if (parsed.id === scanId || !scanId) {
                    setResult(parsed);
                    setIsLoading(false);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse scan result");
            }
        }

        // Otherwise, use SSR history fallback
        setResult(serverResult);
        setIsLoading(false);
    }, [serverResult, scanId]);

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-[#13ec49] rounded-full animate-spin mb-4"></div>
                <p>Loading your diagnosis...</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
                <IconFileBroken size={48} stroke={1.5} className="text-slate-300 mb-4" />
                <p>No diagnosis found for this scan.</p>
                <BackButton />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen min-h-[100dvh] bg-white font-['Lexend',sans-serif] text-slate-900 pb-20 relative">
            <header className="flex items-center justify-between p-6 sticky top-0 bg-white/90 backdrop-blur-md z-20">
                <BackButton />
                <h1 className="text-xl font-bold m-0 flex-1 text-center text-slate-800 tracking-tight">Diagnostic Results</h1>
                <div className="w-8"></div> {/* Spacer to perfectly center the title against the back button */}
            </header>

            <main className="flex-1 px-4 pb-4 max-w-lg mx-auto w-full">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm mb-6 group">
                    <Image
                        src={result.imageUrl}
                        alt={result.plantName}
                        priority
                        fill
                        sizes="(max-width: 768px) 100vw, 512px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Status Badge Over Image matching Stitch */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-slate-100">
                        {result.isHealthy ? (
                            <>
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Healthy</span>
                            </>
                        ) : (
                            <>
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                                </span>
                                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Attention Needed</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight m-0">
                            {result.title || result.diagnosis || (result.isHealthy ? 'Healthy Plant' : 'Unknown Condition')}
                        </h1>
                        <div className="flex items-center gap-1.5 bg-[#13ec491a] px-3 py-1.5 rounded-full shrink-0 border border-[#13ec4933]">
                            <span className="text-sm font-bold text-[#0fb337]">{(result.confidenceScore * 100).toFixed(0)}% Match</span>
                        </div>
                    </div>

                    <p className="text-slate-600 text-base leading-relaxed mt-2 mb-0">
                        {result.isHealthy
                            ? "Your plant appears to be in good health. Keep up the regular watering and observation!"
                            : "Please review the recommended treatments below to help your plant recover."}
                    </p>
                </div>

                {(!result.isHealthy && result.treatment && result.treatment.length > 0) && (
                    <>
                        <hr className="border-slate-200 mb-6" />
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-slate-900 m-0">Recommended Actions</h3>
                                {result.urgencyLevel && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-1 ${result.urgencyLevel.toLowerCase() === 'high'
                                        ? 'bg-red-100 text-red-700'
                                        : result.urgencyLevel.toLowerCase() === 'medium'
                                            ? 'bg-orange-100 text-orange-700'
                                            : 'bg-green-100 text-green-700'
                                        }`}>
                                        {result.urgencyLevel} Urgency
                                    </span>
                                )}
                            </div>

                            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                                <ul className="space-y-4 list-none m-0 p-0">
                                    {result.treatment.map((action: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#13ec4933]">
                                                <span className="text-[#0fb337] text-sm font-bold">✓</span>
                                            </div>
                                            <div>
                                                <span className="block text-slate-600 text-sm">{action}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </>
                )}

                {/* Integrated Tips Component from Home */}
                <div className="mt-6">
                    <PlantTip />
                </div>

                {/* Scan Another Plant Button */}
                <div className="mt-6 mb-4">
                    <Link href="/?action=camera" className="w-full bg-[#0d3512] hover:bg-[#0a2b0e] text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_10px_15px_-3px_rgba(17,212,66,0.1)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 no-underline cursor-pointer border-none">
                        <IconScan size={20} stroke={2.5} />
                        <span className="text-base text-white">Scan Another Plant</span>
                    </Link>
                </div>
            </main>

            {/* Bottom Nav is handled globally */}
        </div>
    );
}
