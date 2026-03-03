import { ApiAuthGateway } from '../../features/auth/infrastructure/gateways/ApiAuthGateway';
import { LoginUseCase } from '../../features/auth/application/use-cases/LoginUseCase';
import { RegisterUseCase } from '../../features/auth/application/use-cases/RegisterUseCase';
import { ApiPlantScanGateway } from '../../features/plants/infrastructure/gateways/ApiPlantScanGateway';
import { ScanPlantUseCase } from '../../features/plants/application/use-cases/ScanPlantUseCase';

export const getLoginUseCase = (): LoginUseCase => {
    const authGateway = new ApiAuthGateway();
    return new LoginUseCase(authGateway);
};

export const getRegisterUseCase = (): RegisterUseCase => {
    const authGateway = new ApiAuthGateway();
    return new RegisterUseCase(authGateway);
};

export const getScanPlantUseCase = (): ScanPlantUseCase => {
    const gateway = new ApiPlantScanGateway(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000');
    return new ScanPlantUseCase(gateway);
};
