"use client";

import { usePathname } from 'next/navigation';
import BottomNav from '@/features/shared/presentation/components/BottomNav';

export default function GlobalBottomNav() {
    const pathname = usePathname();

    // Routes where we DO NOT want to show the bottom navigation
    const hideOnRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

    // If current path exactly matches a hidden route, don't render Nav
    if (hideOnRoutes.includes(pathname)) {
        return null;
    }

    return <BottomNav />;
}
