import { IPlantScanGateway } from '../../domain/ports/IPlantScanGateway';
import { ScanPlantDTO } from '../../application/dtos/ScanPlantDTO';
import { PlantScanResult } from '../../domain/entities/PlantScanResult';
import { AppError } from '@/core/errors/AppError';
import { getAccessToken } from '@/features/auth/infrastructure/utils/tokenManager';

export class ApiPlantScanGateway implements IPlantScanGateway {
    constructor(private readonly baseUrl: string) { }

    async scanPlant(dto: ScanPlantDTO): Promise<PlantScanResult> {
        const formData = new FormData();
        formData.append('photo', dto.photo);

        const accessToken = await getAccessToken();

        try {
            const headers: Record<string, string> = {
                'accept': 'application/json',
            };

            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            }

            const response = await fetch(`${this.baseUrl}/api/plant-health/`, {
                method: 'POST',
                headers,
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 422) {
                    throw new AppError(
                        "Oops, our AI botanist is a bit confused! It couldn't spot a plant in this photo. Please make sure the leaves are clearly visible and try taking another shot.",
                        422
                    );
                }

                if (response.status === 429) {
                    throw new AppError(
                        "Whoa! Our AI botanist has looked at so many leaves today its eyes are crossing! 😵🌿 It needs a quick photosynthesis break (API Limit Reached). Give it a little bit to recharge and try again.",
                        429
                    );
                }

                if (response.status === 500) {
                    throw new AppError(
                        "Our AI botanists are helping a lot of plant lovers right now! Please try scanning your plant again in a few moments.",
                        500
                    );
                }

                throw new AppError(errorData.message || 'Failed to scan plant', response.status);
            }

            const data = await response.json();

            // Handle base64 photo prefix
            let imageUrl = data.photo || '';
            if (imageUrl && !imageUrl.startsWith('data:image')) {
                imageUrl = `data:image/jpeg;base64,${imageUrl}`;
            }

            if (!imageUrl && dto.photo) {
                const arrayBuffer = await dto.photo.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                imageUrl = `data:${dto.photo.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
            }

            // Map API response to our Domain Entity
            return {
                id: data.id || Date.now().toString(),
                plantName: data.diagnosis || 'Scanned Plant',
                title: data.title,
                isHealthy: data.is_healthy ?? false,
                diagnosis: data.diagnosis,
                treatment: Array.isArray(data.treatment) ? data.treatment : [],
                confidenceScore: data.confidence ?? 0,
                urgencyLevel: data.urgency_level,
                imageUrl: imageUrl,
                scannedAt: data.created_at ? new Date(data.created_at) : new Date(),
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Network error while analyzing plant', 500);
        }
    }
}
