import BottomNav from "@/features/shared/presentation/components/BottomNav";

export default function HomeLoading() {
    return (
        <div className="relative flex flex-col min-h-screen min-h-[100dvh] w-full overflow-hidden bg-[#f6f8f6] font-['Lexend',sans-serif] text-slate-900 antialiased">
            {/* Header Skeleton */}
            <header className="sticky top-0 z-20 flex items-center justify-between px-6 pt-6 pb-2 bg-[#f6f8f6e6] backdrop-blur-sm animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                    <div>
                        <div className="h-3 w-20 bg-slate-200 rounded mb-1"></div>
                        <div className="h-4 w-24 bg-slate-300 rounded"></div>
                    </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-200"></div>
            </header>

            {/* Main Content Skeleton */}
            <main className="flex-1 overflow-y-auto pb-24 px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-pulse">
                {/* Greeting */}
                <section className="mt-6 mb-8">
                    <div className="h-8 w-32 bg-slate-300 rounded mb-2"></div>
                    <div className="h-8 w-48 bg-slate-200 rounded mb-4"></div>
                    <div className="h-4 w-64 bg-slate-200 rounded"></div>
                </section>

                {/* Uploader Skeleton */}
                <section className="relative mb-10 w-full">
                    <div className="h-[180px] w-full bg-slate-200 rounded-3xl"></div>
                </section>

                {/* Recent Diagnoses Skeleton */}
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-6 w-36 bg-slate-300 rounded"></div>
                        <div className="h-4 w-16 bg-slate-200 rounded"></div>
                    </div>
                    <div className="flex gap-4 overflow-x-hidden">
                        <div className="shrink-0 w-60 h-48 bg-slate-200 rounded-2xl"></div>
                        <div className="shrink-0 w-60 h-48 bg-slate-200 rounded-2xl"></div>
                    </div>
                </section>

                {/* Tip Skeleton */}
                <section className="mt-6">
                    <div className="h-20 w-full bg-slate-200 rounded-2xl"></div>
                </section>
            </main>

            <BottomNav currentPath="/" />
        </div>
    );
}
