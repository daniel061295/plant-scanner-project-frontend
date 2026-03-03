"use server";

import { getScanPlantUseCase } from "@/core/di";
import { revalidatePath } from "next/cache";

export async function scanPlantAction(formData: FormData) {
    const photo = formData.get('photo') as File | null;

    if (!photo) {
        return { error: 'No photo provided' };
    }

    try {
        const useCase = getScanPlantUseCase();
        const result = await useCase.execute({ photo });

        // Purge the router cache for the Home and History pages
        // so that returning users immediately see their new scan.
        revalidatePath('/');
        revalidatePath('/history');

        // Convert Dates and other objects to plain values since Next.js passes this to client
        return {
            success: true,
            data: {
                ...result,
                scannedAt: result.scannedAt.toISOString(),
            }
        };
    } catch (error: unknown) {
        console.error("Plant Scan Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to analyze plant'
        };
    }
}
