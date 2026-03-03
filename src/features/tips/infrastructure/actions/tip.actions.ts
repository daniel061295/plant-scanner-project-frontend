"use server";

import { GetTipsUseCase } from "../../application/use-cases/GetTipsUseCase";
import { ApiTipGateway } from "../gateways/ApiTipGateway";
import { Tip } from "../../domain/entities/Tip";

// Manual DI Factory
function getGetTipsUseCase() {
    return new GetTipsUseCase(new ApiTipGateway());
}

export async function getTipsAction(): Promise<{ success: boolean; data?: Tip[]; error?: string }> {
    try {
        const useCase = getGetTipsUseCase();
        const tips = await useCase.execute();

        if (!tips || tips.length === 0) {
            return { success: false, error: "No tips found" };
        }

        return { success: true, data: tips };
    } catch (error: any) {
        console.error("getTipsAction Error:", error);
        return { success: false, error: error.message || "Failed to get tips" };
    }
}
