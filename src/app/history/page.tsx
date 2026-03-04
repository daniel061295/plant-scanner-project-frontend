import { redirect } from "next/navigation";
import { getScanHistoryAction } from "@/features/history/infrastructure/actions/history.actions";
import { PlantScanResult } from "@/features/plants/domain/entities/PlantScanResult";
import HistoryClient from "./HistoryClient";
import { getSession } from "@/core/auth/getSession";

export const metadata = {
    title: "Scan History - Plant Health App",
};

export default async function HistoryPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    // Fetch real History Data
    const response = await getScanHistoryAction();
    const rawHistoryResults: PlantScanResult[] = response.success && response.data ? response.data : [];

    return (
        <>
            <HistoryClient initialScans={rawHistoryResults} />
        </>
    );
}
