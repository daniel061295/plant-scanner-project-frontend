import { PlantScanResult } from "@/features/plants/domain/entities/PlantScanResult";

export interface IHistoryRepository {
    getScanHistory(): Promise<PlantScanResult[]>;
}
