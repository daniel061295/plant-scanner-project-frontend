import BottomNav from "@/features/shared/presentation/components/BottomNav";
import { IconArrowLeft, IconSettings, IconMoon, IconLanguage, IconChevronRight } from "@tabler/icons-react";

export default function ProfileLoading() {
    return (
        <div className="flex flex-col min-h-screen w-full bg-[#f6f8f6] font-['Lexend',sans-serif] text-slate-900 antialiased">
            {/* Header */}
            <header className="flex items-center justify-between p-6 sticky top-0 bg-[#f6f8f6]/90 backdrop-blur-md z-20">
                <div className="text-slate-600 flex items-center justify-center">
                    <IconArrowLeft size={24} stroke={1.5} />
                </div>
                <h1 className="text-xl font-bold m-0 flex-1 text-center tracking-tight">Profile</h1>
                <div className="text-slate-600 flex items-center justify-center">
                    <IconSettings size={24} stroke={1.5} />
                </div>
            </header>

            <main className="flex-1 pb-28 px-6 animate-pulse">
                {/* Profile Header Skeleton */}
                <div className="flex flex-col items-center pt-2 pb-8 px-6">
                    <div className="w-24 h-24 rounded-full bg-slate-200 mb-4"></div>
                    <div className="h-6 w-32 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 w-40 bg-slate-200 rounded"></div>
                </div>

                {/* Stats Skeleton */}
                <div className="px-6 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center h-[120px]">
                            <div className="w-10 h-10 rounded-lg bg-slate-200 mb-3"></div>
                            <div className="h-4 w-16 bg-slate-200 rounded mb-2"></div>
                            <div className="h-6 w-8 bg-slate-200 rounded"></div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center h-[120px]">
                            <div className="w-10 h-10 rounded-lg bg-slate-200 mb-3"></div>
                            <div className="h-4 w-16 bg-slate-200 rounded mb-2"></div>
                            <div className="h-6 w-8 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Subscription Skeleton */}
                <div className="px-6 flex flex-col gap-4 mb-8">
                    <div className="h-4 w-24 bg-slate-200 rounded mb-1"></div>
                    <div className="relative flex flex-col p-6 rounded-2xl bg-white border-2 border-slate-100 shadow-sm h-[200px]">
                        <div className="h-6 w-20 bg-slate-200 rounded mb-2"></div>
                        <div className="h-8 w-24 bg-slate-200 rounded mb-6"></div>
                        <div className="h-4 w-48 bg-slate-200 rounded mb-3"></div>
                        <div className="h-4 w-48 bg-slate-200 rounded mb-6"></div>
                        <div className="h-10 w-full bg-slate-200 rounded-xl mt-auto"></div>
                    </div>
                </div>

                {/* App Settings Skeleton */}
                <div className="px-6 flex flex-col gap-2 mb-8">
                    <div className="h-4 w-24 bg-slate-200 rounded mb-2 pl-2"></div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl w-full">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                                <IconMoon size={24} stroke={1.5} />
                            </div>
                            <span className="font-medium text-slate-900">Dark Mode</span>
                        </div>
                        <div className="w-11 h-6 bg-slate-200 rounded-full"></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl w-full">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                                <IconLanguage size={24} stroke={1.5} />
                            </div>
                            <span className="font-medium text-slate-900">Language</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <div className="h-4 w-12 bg-slate-200 rounded"></div>
                            <IconChevronRight size={20} stroke={1.5} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
