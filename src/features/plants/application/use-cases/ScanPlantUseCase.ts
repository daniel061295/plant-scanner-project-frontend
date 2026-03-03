import { IPlantScanGateway } from '../../domain/ports/IPlantScanGateway';
import { ScanPlantDTO } from '../dtos/ScanPlantDTO';
import { PlantScanResult } from '../../domain/entities/PlantScanResult';
import { AppError } from '@/core/errors/AppError';

export class ScanPlantUseCase {
    constructor(private readonly gateway: IPlantScanGateway) { }

    async execute(dto: ScanPlantDTO): Promise<PlantScanResult> {
        if (!dto.photo) {
            throw new AppError('A photo is required for scanning', 400);
        }

        // Check file size, type, etc. could go here
        if (dto.photo.size > 10 * 1024 * 1024) {
            throw new AppError('Photo size exceeds 10MB limit', 413);
        }

        try {
            const result = await this.gateway.scanPlant(dto);
            return result;
        } catch (error) {
            // Assuming it's already an AppError or we map it
            throw error;
        }
    }
}
