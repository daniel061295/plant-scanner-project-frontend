"use server";

import { Plan } from "../../domain/entities/plan.entity";
import { Subscription } from "../../domain/entities/subscription.entity";
import { getPlansUseCase, getCurrentSubscriptionUseCase } from "../di";

export async function getPlansAction(): Promise<{ success: boolean; data?: Plan[]; error?: string }> {
    try {
        const useCase = getPlansUseCase();
        const plans = await useCase.execute();

        // Since we are returning data from a Server Action to Client Components or Server Components,
        // we map it to plain objects to ensure serializability, though Next.js Server Actions 
        // handle plain classes somewhat, it's safer to return plain objects.
        const serializedPlans = plans.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            scanLimitPerDay: p.scanLimitPerDay,
            adsEnabled: p.adsEnabled,
            features: p.features,
            isActive: p.isActive
        })) as unknown as Plan[]; // Cast it back for typing, or leave it mapped

        return { success: true, data: serializedPlans };
    } catch (error: any) {
        console.error("Error in getPlansAction:", error);
        return { success: false, error: error.message || "Failed to fetch plans" };
    }
}

export async function getCurrentSubscriptionAction(): Promise<{ success: boolean; data?: Subscription | null; error?: string }> {
    try {
        const useCase = getCurrentSubscriptionUseCase();
        const subscription = await useCase.execute();

        if (!subscription) {
            return { success: true, data: null };
        }

        const serializedSubscription = {
            planName: subscription.planName,
            planId: subscription.planId,
            status: subscription.status,
            scanLimitPerDay: subscription.scanLimitPerDay,
            adsEnabled: subscription.adsEnabled,
            usageToday: subscription.usageToday,
            features: subscription.features
        } as unknown as Subscription;

        return { success: true, data: serializedSubscription };
    } catch (error: any) {
        console.error("Error in getCurrentSubscriptionAction:", error);
        return { success: false, error: error.message || "Failed to fetch current subscription" };
    }
}
