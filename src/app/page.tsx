import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { IconSettings, IconHistory, IconDroplet } from '@tabler/icons-react';
import PlantUploader from "@/features/plants/presentation/components/PlantUploader";
import RecentScansCarousel, { RecentScan } from "@/features/plants/presentation/components/RecentScansCarousel";
import { getScanHistoryAction } from "@/features/history/infrastructure/actions/history.actions";
import PlantTip from "@/features/shared/presentation/components/PlantTip";
import { getSession } from "@/core/auth/getSession";
import { getFirstName } from "@/core/utils/user";

export const dynamic = 'force-dynamic';

// Helper to format date relative to now
function getRelativeTime(dateInput?: string | Date): string {
  if (!dateInput) return "Unknown time";
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${Math.max(1, diffMins)} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 30) return `${diffDays} days ago`;

  return date.toLocaleDateString();
}

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch actual history for recent diagnoses
  const historyResponse = await getScanHistoryAction();
  let recentScans: RecentScan[] = [];

  if (historyResponse.success && historyResponse.data) {
    const sorted = [...historyResponse.data].sort((a, b) => {
      const da = a.scannedAt ? new Date(a.scannedAt).getTime() : 0;
      const db = b.scannedAt ? new Date(b.scannedAt).getTime() : 0;
      return db - da; // Descending
    });

    recentScans = sorted.slice(0, 5).map(item => ({
      id: item.id,
      name: item.title || item.plantName,
      time: getRelativeTime(item.scannedAt),
      category: item.isHealthy ? 'Healthy' : 'Attention Needed',
      imgUrl: item.imageUrl || ''
    }));
  }

  return (
    <div className="relative flex flex-col min-h-screen min-h-[100dvh] w-full overflow-hidden bg-[#f6f8f6] font-['Lexend',sans-serif] text-slate-900 antialiased">
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 pt-6 pb-2 bg-[#f6f8f6e6] backdrop-blur-sm">
        <Link href="/profile" className="flex items-center gap-3 no-underline cursor-pointer group">
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#13ec49] p-0.5 group-hover:border-[#0fb839] transition-colors">
            <img
              alt="User Profile"
              className="h-full w-full rounded-full object-cover"
              src={session.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user?.name || 'User')}&background=13ec49&color=fff`}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 m-0">Welcome back,</p>
            <h3 className="text-sm font-bold text-slate-900 m-0 group-hover:text-[#0fb839] transition-colors">{getFirstName(session.user?.name, session.user?.email)}</h3>
          </div>
        </Link>
        <Link href="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border-none cursor-pointer transition-colors duration-200 text-slate-700 hover:bg-slate-50">
          <IconSettings size={22} stroke={1.5} />
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <section className="mt-6 mb-8">
          <h1 className="text-3xl font-bold leading-tight text-slate-900 m-0 mb-3">
            Hello, <br />
            <span className="text-[#0fb839]">{getFirstName(session.user?.name, session.user?.email)}! 🌱</span>
          </h1>
          <p className="text-base text-slate-600 leading-relaxed max-w-[90%] m-0">
            Identify diseases and get instant care tips for your garden in seconds.
          </p>
        </section>

        <section className="mt-8 mb-12">
          <Suspense fallback={<div className="h-40 w-full animate-pulse bg-slate-100 rounded-3xl" />}>
            <PlantUploader />
          </Suspense>
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 m-0">Recent Diagnoses</h2>
            <Link href="/history" className="text-xs font-semibold text-[#0fb839] no-underline hover:underline">View All</Link>
          </div>

          {recentScans.length > 0 ? (
            <RecentScansCarousel scans={recentScans} />
          ) : (
            <div className="text-center py-6 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-500 text-sm">
              <IconHistory size={32} stroke={1.5} className="block text-slate-300 mx-auto w-full mb-2" />
              No recent scans yet. Scan a plant to get started!
            </div>
          )}
        </section>

        <section className="mt-6">
          <PlantTip />
        </section>
      </main>
    </div>
  );
}
