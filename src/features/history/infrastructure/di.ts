import { GetScanHistoryUseCase } from "../application/use-cases/GetScanHistoryUseCase";
import { GetScanByIdUseCase } from "../application/use-cases/GetScanByIdUseCase";
import { ApiHistoryRepository } from "./repositories/ApiHistoryRepository";

export function getScanHistoryUseCase(): GetScanHistoryUseCase {
    const repository = new ApiHistoryRepository();
    return new GetScanHistoryUseCase(repository);
}

export function getScanByIdUseCase(): GetScanByIdUseCase {
    const repository = new ApiHistoryRepository();
    return new GetScanByIdUseCase(repository);
}
