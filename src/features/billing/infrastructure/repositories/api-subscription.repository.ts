import { Subscription } from "../../domain/entities/subscription.entity";
import { ISubscriptionRepository } from "../../domain/ports/subscription.repository.interface";
import { getSession } from "@/core/auth/getSession";

export class ApiSubscriptionRepository implements ISubscriptionRepository {
    async getCurrentSubscription(): Promise<Subscription | null> {
        const session = await getSession();

        const headers: Record<string, string> = {
            "accept": "application/json",
        };

        if (session?.accessToken) {
            headers["Authorization"] = `Bearer ${session.accessToken}`;
        } else {
            return null; // Cannot fetch subscription without authentication
        }

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            const response = await fetch(`${baseUrl}/billing/me/`, {
                method: "GET",
                headers,
                // Cache control can be short as usage might change frequently
                next: { revalidate: 0 } // Cache should be minimal or disabled for user-specific real-time data
            });

            if (!response.ok) {
                if (response.status === 404) return null; // User might not have a billing record yet

                throw new Error(`Failed to fetch current subscription: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            return new Subscription(
                data.plan_name,
                data.plan_id,
                data.status,
                data.scan_limit_per_day,
                data.ads_enabled,
                data.usage_today,
                data.features
            );
        } catch (err) {
            console.error("API Error fetching subscription:", err);
            return null;
        }
    }
}
