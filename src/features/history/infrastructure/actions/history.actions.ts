"use server";

import { getScanHistoryUseCase, getScanByIdUseCase } from "../di";
import { getSession } from "@/core/auth/getSession";

export async function getScanHistoryAction() {
    try {
        const session = await getSession();

        const useCase = getScanHistoryUseCase();
        const result = await useCase.execute();
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Failed to fetch history:", error);
        return { success: false, error: error.message };
    }
}

export async function getScanByIdAction(id: string) {
    try {
        const useCase = getScanByIdUseCase();
        const result = await useCase.execute(id);
        return { success: true, data: result };
    } catch (error: any) {
        console.error(`Failed to fetch scan by id ${id}:`, error);
        return { success: false, error: error.message };
    }
}
