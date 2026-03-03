import { Plan } from "../../domain/entities/plan.entity";
import { IPlanRepository } from "../../domain/ports/plan.repository.interface";
import { getSession } from "@/core/auth/getSession";

export class ApiPlanRepository implements IPlanRepository {
    async getPlans(): Promise<Plan[]> {
        // We get the session to retrieve the access token for the API request
        const session = await getSession();

        const headers: Record<string, string> = {
            "accept": "application/json",
        };

        if (session?.accessToken) {
            headers["Authorization"] = `Bearer ${session.accessToken}`;
        }

        const response = await fetch("http://127.0.0.1:8000/billing/plans/", {
            method: "GET",
            headers,
            // Cache control could be added here based on requirement, e.g., next: { revalidate: 3600 }
            next: { revalidate: 60 } // Cache for 1 minute for plans
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch plans: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Map the backend response to our domain entity
        return data.map((item: any) => new Plan(
            item.id,
            item.name,
            item.price,
            item.scan_limit_per_day,
            item.ads_enabled,
            item.features,
            item.is_active
        ));
    }
}
