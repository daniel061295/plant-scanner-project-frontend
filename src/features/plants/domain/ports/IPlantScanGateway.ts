import { PlantScanResult } from '../entities/PlantScanResult';
import { ScanPlantDTO } from '../../application/dtos/ScanPlantDTO';

export interface IPlantScanGateway {
    scanPlant(dto: ScanPlantDTO): Promise<PlantScanResult>;
}
