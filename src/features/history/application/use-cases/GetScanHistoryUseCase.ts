import { IHistoryRepository } from "../../domain/ports/IHistoryRepository";
import { PlantScanResult } from "@/features/plants/domain/entities/PlantScanResult";

export class GetScanHistoryUseCase {
    constructor(private readonly historyRepository: IHistoryRepository) { }

    async execute(): Promise<PlantScanResult[]> {
        return this.historyRepository.getScanHistory();
    }
}
