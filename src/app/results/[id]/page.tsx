import { getScanByIdAction } from "@/features/history/infrastructure/actions/history.actions";
import { PlantScanResult } from "@/features/plants/domain/entities/PlantScanResult";
import ResultView from "./ResultView";

export default async function ResultsPage({ params }: { params: { id: string } }) {
    const resolvedParams = await Promise.resolve(params); // Needed for correct asynchronous access in Next 15 page component props
    const { id } = resolvedParams;

    const response = await getScanByIdAction(id);
    const result: PlantScanResult | null = response.success && response.data ? response.data : null;

    return <ResultView serverResult={result} scanId={id} />;
}
