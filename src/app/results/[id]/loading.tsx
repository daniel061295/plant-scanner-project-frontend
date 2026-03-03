import BackButton from "./BackButton";

export default function ResultsLoading() {
    return (
        <div className="flex flex-col min-h-screen min-h-[100dvh] bg-white font-['Lexend',sans-serif] text-slate-900 pb-20 relative">
            <header className="flex items-center justify-between p-6 sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-slate-100 animate-pulse">
                <BackButton />
                <div className="h-6 w-40 bg-slate-200 rounded m-auto flex-1 max-w-[160px]"></div>
                <div className="w-10"></div> {/* Spacer for centering */}
            </header>

            <main className="flex-1 px-4 pb-4 max-w-lg mx-auto w-full animate-pulse mt-6">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm mb-6 bg-slate-200"></div>

                <div className="mb-6">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="h-8 w-48 bg-slate-300 rounded"></div>
                        <div className="h-8 w-24 bg-green-100 rounded-full"></div>
                    </div>

                    <div className="space-y-2 mt-4 mb-0">
                        <div className="h-4 w-full bg-slate-200 rounded"></div>
                        <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                    </div>
                </div>

                <hr className="border-slate-200 mb-6" />

                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-40 bg-slate-300 rounded"></div>
                        <div className="h-5 w-20 bg-slate-100 rounded-full"></div>
                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0"></div>
                            <div className="h-4 w-full bg-slate-100 rounded mt-1"></div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0"></div>
                            <div className="h-4 w-3/4 bg-slate-100 rounded mt-1"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="h-16 w-full bg-blue-50 rounded-lg border border-blue-100"></div>
                </div>

                <div className="mt-6 mb-4">
                    <div className="h-14 w-full bg-[#13ec4933] rounded-xl"></div>
                </div>
            </main>
        </div>
    );
}
