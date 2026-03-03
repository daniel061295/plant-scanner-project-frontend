export interface PlantScanResult {
    id: string;
    plantName: string;
    isHealthy: boolean;
    title?: string;
    diagnosis?: string;
    treatment: string[];
    confidenceScore: number;
    urgencyLevel?: string;
    imageUrl: string;
    scannedAt: Date;
}
