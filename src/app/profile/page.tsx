import { redirect } from "next/navigation";
import BottomNav from "@/features/shared/presentation/components/BottomNav";
import Link from "next/link";
import LogoutButton from "./LogoutButton"; // A client component for logout logic
import { IconArrowLeft, IconSettings, IconEdit, IconMail, IconScan, IconBug, IconUser, IconChevronRight, IconBell, IconLock, IconMoon, IconLanguage, IconCheck } from "@tabler/icons-react";
import { getScanHistoryAction } from "@/features/history/infrastructure/actions/history.actions";
import { getSession } from "@/core/auth/getSession";
import { getPlansAction, getCurrentSubscriptionAction } from "@/features/billing/infrastructure/actions/billing.actions";

export const metadata = {
    title: "User Profile - Plant Health App",
    description: "Manage your profile and settings.",
};

export default async function ProfilePage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    // Fetch History Scans
    const response = await getScanHistoryAction();
    const historyScans = response.success && response.data ? response.data : [];

    // Fetch Plans and Subscription concurrently
    const [plansResponse, subscriptionResponse] = await Promise.all([
        getPlansAction(),
        getCurrentSubscriptionAction()
    ]);

    const plans = plansResponse.success && plansResponse.data ? plansResponse.data : [];
    const currentSubscription = subscriptionResponse.success ? subscriptionResponse.data : null;

    // Sort plans by price inside the render, or just map them
    const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

    // Calculate Stats
    const totalScans = historyScans.length;
    const issuesFound = historyScans.filter((scan: any) => {
        const isHealthy = scan.isHealthy || (scan.diagnosis && scan.diagnosis.toLowerCase() === 'healthy');
        return !isHealthy;
    }).length;

    return (
        <div className="relative flex flex-col min-h-screen min-h-[100dvh] w-full overflow-hidden bg-[#f6f8f6] text-slate-900 antialiased">
            <header className="flex items-center justify-between p-6 sticky top-0 bg-[#f6f8f6]/90 backdrop-blur-md z-20 border-b border-slate-200">
                <Link href="/" className="bg-transparent border-none p-0 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors">
                    <IconArrowLeft size={24} stroke={1.5} />
                </Link>
                <h1 className="text-xl font-bold m-0 flex-1 text-center tracking-tight">Profile</h1>
                <button className="bg-transparent border-none p-0 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors">
                    <IconSettings size={24} stroke={1.5} />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Profile Header */}
                <div className="flex flex-col items-center pt-2 pb-8 px-6">
                    <div className="relative mb-4 cursor-pointer">
                        <div className="w-28 h-28 rounded-full bg-slate-200 overflow-hidden shadow-[0_0_0_4px_#ffffff,0_10px_15px_-3px_rgba(0,0,0,0.1)]">
                            <img
                                alt="User profile"
                                className="w-full h-full object-cover"
                                src={session.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user?.name || 'User')}&background=13ec49&color=fff&size=128`}
                            />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-[#13ec49] text-slate-900 rounded-full p-1.5 flex items-center justify-center shadow-[0_0_0_4px_#ffffff]">
                            <IconEdit size={14} stroke={2} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">{session.user?.name || "User"}</h2>
                    {session.user?.email && (
                        <div className="flex items-center gap-1 text-slate-500">
                            <IconMail size={18} stroke={1.5} />
                            <span className="text-sm font-medium">{session.user.email}</span>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="px-6 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#13ec49]/20 text-[#13ec49] flex items-center justify-center">
                                <IconScan size={24} stroke={1.5} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium m-0">Plants Scanned</p>
                                <p className="text-2xl font-bold text-slate-900 m-0">{totalScans}</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                <IconBug size={24} stroke={1.5} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium m-0">Issues Found</p>
                                <p className="text-2xl font-bold text-slate-900 m-0">{issuesFound}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Choose your plan */}
                <div className="px-6 flex flex-col gap-4 mb-8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1">Subscription</h3>
                    {sortedPlans.map((plan) => {
                        const isPro = plan.name.toUpperCase() === 'PRO';
                        const isCurrentActivePlan = currentSubscription?.planId === plan.id;

                        return (
                            <div key={plan.id} className={`relative flex flex-col p-6 rounded-2xl transition-all ${isPro ? 'bg-gradient-to-r from-white to-[#13ec491a] border-2 border-[#13ec49] shadow-sm shadow-[#13ec49]/20 text-slate-900' : 'bg-white text-slate-800 border-2 border-slate-100 shadow-sm'}`}>
                                {isPro && (
                                    <div className="absolute -top-3 right-6 bg-[#13ec49] text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                        MOST POPULAR
                                    </div>
                                )}
                                <div className="flex flex-col mb-4">
                                    <h4 className={`font-bold text-xl mb-1 ${isPro ? 'text-slate-900' : 'text-slate-900'}`}>{plan.name}</h4>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`font-bold text-3xl ${isPro ? 'text-slate-900' : 'text-slate-900'}`}>${plan.price}</span>
                                        <span className={`text-sm font-medium ${isPro ? 'text-slate-500' : 'text-slate-500'}`}>/month</span>
                                    </div>
                                </div>

                                <ul className="flex flex-col gap-3 mb-6 flex-1">
                                    <li className="flex items-start gap-3">
                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPro ? 'bg-[#13ec49]/20 text-[#13ec49]' : 'bg-green-100 text-green-600'}`}>
                                            <IconCheck size={14} stroke={3} />
                                        </div>
                                        <span className={`text-sm font-medium leading-relaxed ${isPro ? 'text-slate-700' : 'text-slate-600'}`}>
                                            {plan.scanLimitPerDay} AI Scans per day
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPro ? 'bg-[#13ec49]/20 text-[#13ec49]' : 'bg-green-100 text-green-600'}`}>
                                            <IconCheck size={14} stroke={3} />
                                        </div>
                                        <span className={`text-sm font-medium leading-relaxed ${isPro ? 'text-slate-700' : 'text-slate-600'}`}>
                                            {plan.adsEnabled ? 'Ad-supported interface' : 'Ad-free premium experience'}
                                        </span>
                                    </li>
                                </ul>

                                <button
                                    disabled={isCurrentActivePlan}
                                    className={`w-full py-3.5 rounded-xl font-bold transition-transform active:scale-[0.98] disabled:active:scale-100 ${isCurrentActivePlan
                                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                                        : isPro
                                            ? 'bg-[#13ec49] text-slate-900 hover:bg-[#10d441] shadow-md shadow-[#13ec49]/20'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {isCurrentActivePlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
                                </button>
                            </div>
                        );
                    })}
                    {sortedPlans.length === 0 && (
                        <p className="text-sm text-slate-500 px-2 text-center py-4 bg-white rounded-xl border border-dashed border-slate-200">No plans available at the moment.</p>
                    )}
                </div>

                {/* App Settings */}
                <div className="px-6 flex flex-col gap-2 mb-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 mb-2">App Settings</h3>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl w-full">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                                <IconMoon size={24} stroke={1.5} />
                            </div>
                            <span className="font-medium text-slate-900">Dark Mode</span>
                        </div>
                        {/* Simple toggle UI */}
                        <div className="w-11 h-6 bg-slate-200 rounded-full cursor-pointer relative transition-colors">
                            <div className="w-5 h-5 bg-white rounded-full absolute top-[2px] left-[2px] shadow-sm transition-transform"></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl w-full cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                                <IconLanguage size={24} stroke={1.5} />
                            </div>
                            <span className="font-medium text-slate-900">Language</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <span className="text-sm font-medium">English</span>
                            <IconChevronRight size={20} stroke={1.5} />
                        </div>
                    </div>
                </div>

                {/* Account Links */}
                <div className="px-6 flex flex-col gap-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 mb-2">Account</h3>

                    <Link href="#" className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-slate-50 transition-colors w-full cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center transition-colors group-hover:bg-[#13ec49]/20 group-hover:text-[#13ec49]">
                                <IconUser size={24} stroke={1.5} />
                            </div>
                            <span className="font-medium text-slate-900">Account Settings</span>
                        </div>
                        <IconChevronRight size={20} stroke={1.5} className="text-slate-400" />
                    </Link>

                    <Link href="#" className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-slate-50 transition-colors w-full cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center transition-colors group-hover:bg-[#13ec49]/20 group-hover:text-[#13ec49]">
                                <IconBell size={24} stroke={1.5} />
                            </div>
                            <span className="font-medium text-slate-900">Notification Preferences</span>
                        </div>
                        <IconChevronRight size={20} stroke={1.5} className="text-slate-400" />
                    </Link>

                    <Link href="#" className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-slate-50 transition-colors w-full cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center transition-colors group-hover:bg-[#13ec49]/20 group-hover:text-[#13ec49]">
                                <IconLock size={24} stroke={1.5} />
                            </div>
                            <span className="font-medium text-slate-900">Privacy Policy</span>
                        </div>
                        <IconChevronRight size={20} stroke={1.5} className="text-slate-400" />
                    </Link>

                    <LogoutButton />
                </div>
            </main>

            <BottomNav currentPath="/profile" />
        </div>
    );
}
