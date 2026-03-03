import { IHistoryRepository } from "../../domain/ports/IHistoryRepository";
import { PlantScanResult } from "@/features/plants/domain/entities/PlantScanResult";

export class GetScanByIdUseCase {
    constructor(private readonly historyRepository: IHistoryRepository) { }

    async execute(id: string): Promise<PlantScanResult | null> {
        const history = await this.historyRepository.getScanHistory();
        const scan = history.find(item => item.id === id);
        return scan || null;
    }
}
