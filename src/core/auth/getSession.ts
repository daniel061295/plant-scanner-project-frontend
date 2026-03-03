import { getTokens, getUserIdFromToken, isTokenExpired, storeTokens } from "@/features/auth/infrastructure/utils/tokenManager";
import { ApiAuthGateway } from "@/features/auth/infrastructure/gateways/ApiAuthGateway";
import { ApiIdentityGateway } from "@/features/user/infrastructure/gateways/ApiIdentityGateway";

export interface Session {
    user: {
        id: string;
        email?: string;
        name?: string;
        avatar?: string;
    };
    accessToken?: string;
}

/**
 * Get current session from JWT cookies (Server Components).
 * Always fetches fresh user data from /identity/me/ — no module-level cache
 * so switching users always shows correct data.
 */
export async function getSession(): Promise<Session | null> {
    const tokens = await getTokens();

    if (!tokens || !tokens.accessToken) {
        return null;
    }

    // Refresh token if expired or about to expire (within 1 minute)
    let accessToken = tokens.accessToken;

    if (isTokenExpired(accessToken, 60)) {
        if (!tokens.refreshToken) return null;
        try {
            const authGateway = new ApiAuthGateway();
            const newTokens = await authGateway.refreshToken(tokens.refreshToken);
            await storeTokens(newTokens);
            accessToken = newTokens.accessToken;
        } catch {
            return null;
        }
    }

    // Always fetch fresh profile — no module-level cache to avoid cross-user contamination
    try {
        const identityGateway = new ApiIdentityGateway();
        const profile = await identityGateway.getProfile();

        return {
            user: {
                id: profile.id,
                email: profile.email,
                name: profile.name,
                avatar: profile.avatar,
            },
            accessToken,
        };
    } catch {
        // Fall back to token-based ID if identity endpoint fails
        const userId = getUserIdFromToken(accessToken);
        return {
            user: {
                id: userId || 'unknown',
                email: undefined,
                name: undefined,
                avatar: undefined,
            },
            accessToken,
        };
    }
}

/**
 * No-op kept for backward compatibility with existing imports.
 * Cache was removed — this function is intentionally empty.
 */
export function clearProfileCache(): void {
    // intentionally empty — cache removed
}
