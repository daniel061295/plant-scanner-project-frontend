import { IHistoryRepository } from "../../domain/ports/IHistoryRepository";
import { PlantScanResult } from "@/features/plants/domain/entities/PlantScanResult";
import { getAccessToken } from "@/features/auth/infrastructure/utils/tokenManager";

export class ApiHistoryRepository implements IHistoryRepository {
    private readonly apiUrl: string;

    constructor() {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        this.apiUrl = `${baseUrl}/api/history/me/`;
    }

    async getScanHistory(): Promise<PlantScanResult[]> {
        const accessToken = await getAccessToken();

        const headers: Record<string, string> = {
            'accept': '*/*',
        };

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(this.apiUrl, {
            method: 'GET',
            headers,
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Authentication required. Please log in again.');
            }
            if (response.status === 404) {
                throw new Error('History endpoint not available');
            }
            throw new Error(`Failed to fetch history: ${response.status}`);
        }

        const data: any[] = await response.json();

        return data.map(item => {
            // Handle base64 photo prefix
            let imageUrl = item.photo || '';
            // Only add the data: prefix if it's raw Base64 (not a full URL or existing data URI)
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                imageUrl = `data:image/jpeg;base64,${imageUrl}`;
            }

            return {
                id: item.id,
                plantName: item.diagnosis || 'Unknown Plant',
                title: item.title,
                isHealthy: item.is_healthy,
                diagnosis: item.diagnosis,
                treatment: item.treatment || [],
                confidenceScore: item.confidence,
                urgencyLevel: item.urgency_level,
                imageUrl: imageUrl,
                scannedAt: new Date(item.created_at)
            };
        });
    }
}
