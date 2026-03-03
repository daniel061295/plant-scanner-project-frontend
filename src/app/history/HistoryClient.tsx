"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { PlantScanResult } from "@/features/plants/domain/entities/PlantScanResult";
import { IconSearch, IconHistory, IconCircleCheck, IconVirus, IconStethoscope, IconBug, IconArrowLeft, IconX, IconChevronRight } from "@tabler/icons-react";

interface HistoryClientProps {
    initialScans: PlantScanResult[];
}

// Helper functions to group and format
const formatTime = (dateInput: Date | string) => {
    const date = new Date(dateInput);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getDateString = (dateInput: Date | string) => {
    const date = new Date(dateInput);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
};

export default function HistoryClient({ initialScans }: HistoryClientProps) {
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Focus input when search is opened
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    // Check which categories have items based on RAW scans
    const hasHealthy = initialScans.some(item => item.isHealthy || (item.diagnosis && item.diagnosis.toLowerCase() === 'healthy'));
    const hasLow = initialScans.some(item => !item.isHealthy && item.urgencyLevel === 'Low');
    const hasMedium = initialScans.some(item => !item.isHealthy && item.urgencyLevel === 'Medium');
    const hasHigh = initialScans.some(item => !item.isHealthy && item.urgencyLevel === 'High');

    // Filter by urgency/healthy
    let filteredScans = [...initialScans];
    if (filter === 'Healthy') {
        filteredScans = filteredScans.filter(item => item.isHealthy || (item.diagnosis && item.diagnosis.toLowerCase() === 'healthy'));
    } else if (filter === 'Low' || filter === 'Medium' || filter === 'High') {
        filteredScans = filteredScans.filter(item => !item.isHealthy && item.urgencyLevel === filter);
    }

    // Filter by search query (live, keystroke-by-keystroke)
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredScans = filteredScans.filter(item => {
            // Concatenate all search fields so the query can match any of them
            const searchableText = `${item.title || ''} ${item.plantName || ''} ${item.diagnosis || ''}`.toLowerCase();
            return searchableText.includes(query);
        });
    }

    // Grouping logic for the final list
    const groupedData = useMemo(() => {
        return filteredScans.reduce((acc, currentItem) => {
            const dateStr = getDateString(currentItem.scannedAt);
            const existingGroup = acc.find(g => g.dateString === dateStr);

            let statusType = currentItem.isHealthy ? 'healthy' : 'disease';
            if (!currentItem.isHealthy && currentItem.diagnosis && currentItem.diagnosis.toLowerCase().includes('pest')) {
                statusType = 'pest';
            } else if (!currentItem.isHealthy && currentItem.diagnosis && currentItem.diagnosis.toLowerCase().includes('deficiency')) {
                statusType = 'deficiency';
            }

            let iconName = 'IconCircleCheck';
            if (statusType === 'pest') iconName = 'IconBug';
            if (statusType === 'deficiency') iconName = 'IconStethoscope';
            if (statusType === 'disease') iconName = 'IconVirus';

            const mappedItem = {
                id: currentItem.id,
                name: currentItem.title || currentItem.plantName || currentItem.diagnosis || 'Unknown Plant',
                time: formatTime(currentItem.scannedAt),
                statusType,
                statusLabel: currentItem.diagnosis || (currentItem.isHealthy ? 'Healthy' : 'Needs attention'),
                urgencyLevel: currentItem.urgencyLevel,
                iconName,
                imageUrl: currentItem.imageUrl,
            };

            if (existingGroup) {
                existingGroup.items.push(mappedItem);
            } else {
                acc.push({
                    dateString: dateStr,
                    items: [mappedItem]
                });
            }
            return acc;
        }, [] as { dateString: string, items: any[] }[]);
    }, [filteredScans]);

    return (
        <div className="flex flex-col min-h-screen min-h-[100dvh] bg-[#f6f8f6] font-['Lexend',sans-serif] text-slate-900 pb-20 relative">
            {/* Sticky Header Container */}
            <div className="sticky top-0 z-20 bg-[#f6f8f6]/90 backdrop-blur-md">
                {/* Header */}
                <header className="flex flex-col pt-6 px-6">
                    <div className="flex items-center justify-between pb-4">
                        <Link href="/" className="bg-transparent border-none p-0 text-slate-600 cursor-pointer transition-colors hover:text-slate-900 flex items-center justify-center">
                            <IconArrowLeft size={24} stroke={1.5} />
                        </Link>

                        {/* Animated Search Box overlaying the title */}
                        <div className="flex-1 relative flex items-center justify-center">
                            <div
                                className={`absolute inset-0 flex items-center transition-all duration-300 ease-out z-10 ${isSearchOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                            >
                                <div className="relative w-full max-w-[240px] mx-auto flex items-center bg-white rounded-full shadow-sm border border-[#13ec4980] overflow-hidden">
                                    <IconSearch size={18} stroke={2} className="text-slate-400 ml-3 shrink-0" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search plants..."
                                        className="w-full bg-transparent border-none py-2 px-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="bg-transparent border-none p-2 mr-1 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
                                        >
                                            <IconX size={16} stroke={2} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Standard Title */}
                            <h1 className={`text-xl font-bold m-0 text-center text-slate-800 tracking-tight transition-opacity duration-300 ${isSearchOpen ? 'opacity-0' : 'opacity-100'}`}>
                                Scan History
                            </h1>
                        </div>

                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`bg-transparent border-none p-0 cursor-pointer transition-colors flex items-center justify-center ${isSearchOpen ? 'text-[#13ec49]' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            {isSearchOpen ? <IconX size={24} stroke={1.5} /> : <IconSearch size={24} stroke={1.5} />}
                        </button>
                    </div>
                </header>

                {/* Filter Chips */}
                <div className="flex-none px-6 pb-4">
                    <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <button onClick={() => setFilter('All')} className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-transform duration-100 ease-in-out no-underline active:scale-95 flex items-center h-9 ${filter === 'All' ? 'border-none bg-[#0d3512] text-white' : 'border border-slate-200 bg-white/50 text-slate-600 hover:border-[#13ec49]'}`}>All</button>
                        {hasHealthy && <button onClick={() => setFilter('Healthy')} className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-transform duration-100 ease-in-out no-underline active:scale-95 flex items-center h-9 ${filter === 'Healthy' ? 'border-none bg-[#0d3512] text-white' : 'border border-slate-200 bg-white/50 text-slate-600 hover:border-[#13ec49]'}`}>Healthy</button>}
                        {hasLow && <button onClick={() => setFilter('Low')} className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-transform duration-100 ease-in-out no-underline active:scale-95 flex items-center h-9 ${filter === 'Low' ? 'border-none bg-[#0d3512] text-white' : 'border border-slate-200 bg-white/50 text-slate-600 hover:border-[#13ec49]'}`}>Low Urgency</button>}
                        {hasMedium && <button onClick={() => setFilter('Medium')} className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-transform duration-100 ease-in-out no-underline active:scale-95 flex items-center h-9 ${filter === 'Medium' ? 'border-none bg-[#0d3512] text-white' : 'border border-slate-200 bg-white/50 text-slate-600 hover:border-[#13ec49]'}`}>Medium Urgency</button>}
                        {hasHigh && <button onClick={() => setFilter('High')} className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-transform duration-100 ease-in-out no-underline active:scale-95 flex items-center h-9 ${filter === 'High' ? 'border-none bg-[#0d3512] text-white' : 'border border-slate-200 bg-white/50 text-slate-600 hover:border-[#13ec49]'}`}>High Urgency</button>}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 px-4 scroll-smooth">
                {groupedData.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-20 text-slate-500">
                        <IconHistory size={48} stroke={1.5} className="text-slate-300 mb-4" />
                        <p>{searchQuery ? "No results found for your search." : "No scan history found."}</p>
                    </div>
                )}
                {groupedData.map((group, index) => (
                    <div key={index} className="mb-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">{group.dateString}</h3>

                        <div className="flex flex-col gap-3">
                            {group.items.map((item) => {
                                const isHealthy = item.statusType === 'healthy';
                                const isPest = item.statusType === 'pest';
                                const isDeficiency = item.statusType === 'deficiency';
                                const isDisease = item.statusType === 'disease';

                                const urgencyLvl = item.urgencyLevel || '';
                                const statusStyle = isHealthy ? 'bg-[#13ec491a] text-[#0ea635]' :
                                    urgencyLvl === 'High' ? 'bg-red-50 text-red-600' :
                                        urgencyLvl === 'Medium' ? 'bg-orange-50 text-orange-600' :
                                            urgencyLvl === 'Low' ? 'bg-yellow-50 text-yellow-600' : 'bg-slate-100 text-slate-600';
                                const urgencyLabel = isHealthy ? 'Healthy' : (urgencyLvl ? `${urgencyLvl} Urgency` : 'Attention Needed');

                                return (
                                    <Link href={`/results/${item.id}`} key={item.id} className="relative flex items-center gap-4 p-3 bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-slate-100 cursor-pointer transition-all duration-200 hover:border-[#13ec4980] active:scale-[0.99] group no-underline">
                                        <div className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-100">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                                style={{ backgroundImage: `url('${item.imageUrl}')` }}
                                            ></div>
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-base font-semibold text-slate-900 m-0 whitespace-nowrap overflow-hidden text-ellipsis pr-2">{item.name}</h4>
                                                <span className="text-xs font-medium text-slate-400 whitespace-nowrap">{item.time}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 m-0 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                                                {item.statusLabel}
                                            </p>
                                            <div className="inline-flex">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusStyle}`}>
                                                    {isHealthy && <IconCircleCheck size={16} stroke={2} />}
                                                    {isPest && <IconBug size={16} stroke={2} />}
                                                    {isDeficiency && <IconStethoscope size={16} stroke={2} />}
                                                    {isDisease && <IconVirus size={16} stroke={2} />}
                                                    {!isHealthy && !isPest && !isDeficiency && !isDisease && <IconCircleCheck size={16} stroke={2} />}
                                                    <span className="text-xs font-bold">{urgencyLabel}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                            <IconChevronRight size={24} stroke={1.5} className="text-slate-300" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}
