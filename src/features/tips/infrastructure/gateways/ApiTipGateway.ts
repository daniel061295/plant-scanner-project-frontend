import { Tip } from "../../domain/entities/Tip";
import { ITipGateway } from "../../domain/ports/ITipGateway";
import { getAccessToken } from "@/features/auth/infrastructure/utils/tokenManager";

export class ApiTipGateway implements ITipGateway {
    private baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    async getTips(): Promise<Tip[]> {
        try {
            const accessToken = await getAccessToken();

            const headers: Record<string, string> = {
                "accept": "application/json",
            };

            if (accessToken) {
                headers["Authorization"] = `Bearer ${accessToken}`;
            }

            const response = await fetch(`${this.baseUrl}/api/tips/`, {
                method: "GET",
                headers,
                next: { revalidate: 3600 }, // Cache for 1 hour
            });

            if (!response.ok) {
                console.error(`Error fetching tips: ${response.status} ${response.statusText}`);
                return [];
            }

            const data = await response.json();

            // Map JSON array to Domain Entities
            return data.map((item: any) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                icon: item.icon,
                createdAt: new Date(item.created_at),
            }));
        } catch (error) {
            console.error("Failed to fetch tips:", error);
            return [];
        }
    }

    async getRandomTip(): Promise<Tip | null> {
        try {
            const accessToken = await getAccessToken();

            const headers: Record<string, string> = {
                "accept": "application/json",
            };

            if (accessToken) {
                headers["Authorization"] = `Bearer ${accessToken}`;
            }

            const response = await fetch(`${this.baseUrl}/api/tips/random/`, {
                method: "GET",
                headers,
                next: { revalidate: 300 }, // Cache for 5 minutes
            });

            if (!response.ok) {
                console.error(`Error fetching random tip: ${response.status} ${response.statusText}`);
                return null;
            }

            const data = await response.json();

            // Map JSON to Domain Entity
            return {
                id: data.id,
                title: data.title,
                description: data.description,
                icon: data.icon,
                createdAt: new Date(data.created_at),
            };
        } catch (error) {
            console.error("Failed to fetch random tip:", error);
            return null;
        }
    }
}
