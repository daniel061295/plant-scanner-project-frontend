export default function HistoryLoading() {
    return (
        <div className="flex flex-col min-h-screen min-h-[100dvh] bg-[#f6f8f6] font-['Lexend',sans-serif] text-slate-900 overflow-hidden relative">
            {/* Header Skeleton */}
            <header className="flex items-center justify-between p-6 sticky top-0 bg-[#f6f8f6]/90 backdrop-blur-md z-20 border-b border-slate-200 animate-pulse">
                <div className="h-6 w-6 bg-slate-200 rounded-full shrink-0"></div>
                <div className="h-5 w-32 bg-slate-300 rounded m-auto"></div>
                <div className="h-6 w-6 bg-slate-200 rounded-full shrink-0"></div>
            </header>

            {/* Filter Chips Skeleton */}
            <div className="flex-none px-6 pt-4 pb-4 z-10 bg-[#f6f8f6] animate-pulse">
                <div className="flex gap-3 overflow-hidden pb-2">
                    <div className="shrink-0 w-16 h-9 bg-slate-300 rounded-full"></div>
                    <div className="shrink-0 w-20 h-9 bg-slate-200 rounded-full"></div>
                    <div className="shrink-0 w-24 h-9 bg-slate-200 rounded-full"></div>
                    <div className="shrink-0 w-24 h-9 bg-slate-200 rounded-full"></div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <main className="flex-1 overflow-y-auto px-4 pb-24 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-pulse">
                <div className="mb-6">
                    <div className="h-3 w-20 bg-slate-300 rounded mb-3 ml-2"></div>

                    <div className="flex flex-col gap-3">
                        {/* List Item Skeleton */}
                        <div className="relative flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-100">
                            <div className="shrink-0 w-20 h-20 bg-slate-200 rounded-xl"></div>
                            <div className="flex-1 py-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="h-5 w-32 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-12 bg-slate-100 rounded"></div>
                                </div>
                                <div className="h-3 w-20 bg-slate-100 rounded mb-3"></div>
                                <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                            </div>
                        </div>

                        {/* List Item Skeleton */}
                        <div className="relative flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-100">
                            <div className="shrink-0 w-20 h-20 bg-slate-200 rounded-xl"></div>
                            <div className="flex-1 py-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="h-5 w-28 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-12 bg-slate-100 rounded"></div>
                                </div>
                                <div className="h-3 w-16 bg-slate-100 rounded mb-3"></div>
                                <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
