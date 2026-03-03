"use client";

import React, { useRef, useState } from "react";

import Link from "next/link";
import { IconClock } from '@tabler/icons-react';

export type RecentScan = {
    id: string;
    name: string;
    time: string;
    category: string;
    imgUrl: string;
};

interface RecentScansCarouselProps {
    scans: RecentScan[];
}

export default function RecentScansCarousel({ scans }: RecentScansCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isPointerDown = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        isPointerDown.current = true;
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        isPointerDown.current = false;
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        isPointerDown.current = false;
        // Short delay before setting false to prevent firing clicks right after drag
        setTimeout(() => setIsDragging(false), 50);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPointerDown.current || !scrollRef.current) return;

        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX); // 1:1 scrolling feels more natural

        // Only trigger "dragging" state if they moved more than 5px
        if (Math.abs(walk) > 5) {
            setIsDragging(true);
            e.preventDefault();
            scrollRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    return (
        <div
            ref={scrollRef}
            role="region"
            aria-label="Recent scans carousel"
            tabIndex={0}
            className={`flex flex-nowrap gap-4 overflow-x-auto pb-4 -mx-6 px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{
                userSelect: isDragging ? "none" : "auto", // Prevent text selection while dragging
            }}
        >
            {scans.map((scan) => (
                <Link
                    href={`/results/${scan.id}`}
                    key={scan.id}
                    onClick={(e) => {
                        if (isDragging) e.preventDefault();
                    }}
                    className={`shrink-0 w-52 rounded-2xl bg-white shadow-sm border border-slate-100 transition-colors duration-200 hover:border-[#13ec4980] group no-underline flex flex-col overflow-hidden ${isDragging ? "pointer-events-none" : ""
                        }`}
                    onDragStart={(e) => e.preventDefault()} // Prevent native drag behavior on the element
                    style={{ height: "205px" }} // Fixed height to keep cards uniform
                >
                    <div className="relative h-32 w-full bg-slate-100 shrink-0">
                        <img
                            alt={scan.name}
                            className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                            src={scan.imgUrl}
                            onDragStart={(e) => e.preventDefault()} // Extra protection for image default drag
                        />
                        <div
                            className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm shadow-sm ${scan.category === "Healthy"
                                ? "bg-white/90 text-green-700"
                                : "bg-yellow-100 text-yellow-800"
                                }`}
                        >
                            {scan.category}
                        </div>
                    </div>

                    <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-900 text-sm m-0 truncate leading-tight">{scan.name}</h3>

                        <div className="mt-auto pt-2">
                            <p className="text-xs text-slate-500 m-0 flex items-center gap-1">
                                <IconClock size={14} stroke={1.5} />{" "}
                                {scan.time}
                            </p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
