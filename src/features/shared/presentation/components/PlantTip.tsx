"use client";

import React, { useEffect, useState } from "react";
import { getTipsAction } from "../../../tips/infrastructure/actions/tip.actions";
import { Tip } from "../../../tips/domain/entities/Tip";
// Import common icons that might be returned
import {
    IconDroplet,
    IconSun,
    IconLeaf,
    IconRotateClockwise,
    IconBug,
    IconScissors,
    IconTemperature,
    IconInfoCircle,
    IconFriends,
    IconSnowflake,
    IconPlant,
    IconRipple,
    IconThermometer,
    IconArrowsMaximize,
    IconFlask2,
    IconBucket,
    IconMist
} from "@tabler/icons-react";

interface PlantTipProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
}

// Map string keys to specific icons to avoid importing all 4000 tabler icons dynamically
const IconMap: Record<string, any> = {
    "droplet": IconDroplet,
    "sun": IconSun,
    "leaf": IconLeaf,
    "rotate-clockwise": IconRotateClockwise,
    "bug": IconBug,
    "scissors": IconScissors,
    "temperature": IconTemperature,
    "info-circle": IconInfoCircle,
    "friends": IconFriends,
    "snowflake": IconSnowflake,
    "plant": IconPlant,
    "ripple": IconRipple,
    "thermometer": IconThermometer,
    "arrows-maximize": IconArrowsMaximize,
    "flask-2": IconFlask2,
    "bucket": IconBucket,
    "mist": IconMist
};

export default function PlantTip({
    title,
    description,
    icon
}: PlantTipProps) {
    const [allTips, setAllTips] = useState<Tip[]>([]);
    const [currentTip, setCurrentTip] = useState<Tip | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [fade, setFade] = useState<boolean>(true);

    // Default static fallback if API fails
    const defaultFallbackTip: Tip = {
        id: "fallback-id",
        title: "Plant Care",
        description: "Consistency is key for plant health. Keep an eye on watering and light schedules.",
        icon: "info-circle",
        createdAt: new Date(),
    };

    // Helper to pick a random tip that wasn't the last one
    const pickRandomTip = (tips: Tip[], current: Tip | null) => {
        if (!tips || tips.length === 0) return defaultFallbackTip;
        if (tips.length === 1) return tips[0];

        let newTip;
        let attempts = 0;
        do {
            const randomIndex = Math.floor(Math.random() * tips.length);
            newTip = tips[randomIndex];
            attempts++;
        } while (current && newTip.id === current.id && attempts < 10);

        return newTip;
    };

    useEffect(() => {
        let isMounted = true;
        let intervalId: NodeJS.Timeout;

        // If external props are provided, we don't need to fetch
        if (title && description) {
            setLoading(false);
            return;
        }

        const fetchAllTips = async () => {
            try {
                // IMPORTANT: Make sure this imports the NEW getTipsAction
                // In a real refactor, you'd change the import path at the top too!
                const response = await getTipsAction();

                if (isMounted) {
                    if (response.success && response.data && response.data.length > 0) {
                        const tipsArray = response.data;
                        setAllTips(tipsArray);
                        setCurrentTip(pickRandomTip(tipsArray, null));
                    } else {
                        setCurrentTip(defaultFallbackTip);
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch tips:", error);
                if (isMounted) {
                    setCurrentTip(defaultFallbackTip);
                    setLoading(false);
                }
            }
        };

        fetchAllTips();

        // Cleanup
        return () => {
            isMounted = false;
        };
    }, [title, description]);

    // Separate useEffect for handling the interval logic, depending on allTips state
    useEffect(() => {
        if (allTips.length <= 1 || (title && description)) return;

        const intervalId = setInterval(() => {
            setFade(false);

            setTimeout(() => {
                setCurrentTip(prev => pickRandomTip(allTips, prev));
                setFade(true);
            }, 300);
        }, 10000);

        return () => clearInterval(intervalId);
    }, [allTips, title, description]);

    if (loading) {
        return (
            <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-white to-[#13ec491a] p-4 shadow-sm border border-slate-100 animate-pulse">
                <div className="flex shrink-0 h-12 w-12 rounded-full bg-slate-200"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                </div>
            </div>
        );
    }

    const tipTitle = title || currentTip?.title || "Plant Care Tip";
    const tipDescription = description || currentTip?.description || "Give your plant love and care.";

    // Resolve icon component
    let IconComponent = IconDroplet; // default
    if (icon) {
        // If a node was passed, use it directly (handled in render)
    } else if (currentTip?.icon) {
        IconComponent = IconMap[currentTip.icon.toLowerCase()] || IconInfoCircle;
    }

    return (
        <div className={`flex items-center gap-4 rounded-2xl bg-gradient-to-r from-white to-[#13ec491a] p-4 shadow-sm border border-slate-100 transition-opacity duration-300 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex shrink-0 h-12 w-12 items-center justify-center rounded-full bg-[#13ec4933] text-[#0fb839]">
                {icon ? icon : <IconComponent size={24} stroke={1.5} />}
            </div>
            <div>
                <h4 className="text-sm font-bold text-slate-900 m-0 leading-tight">{tipTitle}</h4>
                <p className="text-xs text-slate-600 mt-1 mb-0 leading-relaxed">
                    {tipDescription}
                </p>
            </div>
        </div>
    );
}
