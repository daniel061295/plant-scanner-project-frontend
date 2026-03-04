"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconHistory, IconUser } from '@tabler/icons-react';

export default function BottomNav() {
    const currentPath = usePathname();
    const navItems = [
        { name: 'Home', path: '/', Icon: IconHome },
        { name: 'History', path: '/history', Icon: IconHistory },
        { name: 'Profile', path: '/profile', Icon: IconUser },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 pb-safe pt-2 px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] h-[85px] box-border">
            <div className="flex justify-around items-end h-[60px] pb-2 w-full">
                {navItems.map((item) => {
                    const isActive = currentPath === item.path;
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`group flex flex-col items-center justify-center gap-1 flex-1 no-underline cursor-pointer transition-colors duration-300 hover:text-[#13ec49] ${isActive ? 'text-slate-900' : 'text-slate-400'}`}
                        >
                            <div className={`flex items-center justify-center h-8 w-12 rounded-full transition-all duration-300 relative ${isActive ? 'bg-transparent text-[#166534] scale-110' : 'hover:bg-[#13ec490d] scale-100'}`}>
                                <item.Icon size={28} stroke={isActive ? 2.5 : 1.5} className="transition-all duration-300" />
                                {/* Active Dot Indicator with transition */}
                                <span className={`absolute -top-1 right-2 w-2 h-2 bg-[#166534] rounded-full transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></span>
                            </div>
                            <span className={`text-[10px] transition-all duration-300 ${isActive ? 'font-bold tracking-wide' : 'font-medium'}`}>{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
