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

// Simple in-memory cache for user profile (per-request in server components)
let profileCache: {
    data: Session['user'] | null;
    timestamp: number;
} | null = null;

const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get current session from JWT cookies (Server Components)
 * Automatically refreshes the access token if it's about to expire
 * Fetches user profile from /identity/me/ endpoint
 */
export async function getSession(): Promise<Session | null> {
    const tokens = await getTokens();

    if (!tokens || !tokens.accessToken) {
        return null;
    }

    // Check if token is expired or about to expire (within 1 minute)
    if (isTokenExpired(tokens.accessToken, 60)) {
        // Try to refresh the token
        if (tokens.refreshToken) {
            try {
                const authGateway = new ApiAuthGateway();
                const newTokens = await authGateway.refreshToken(tokens.refreshToken);
                await storeTokens(newTokens);

                // Clear profile cache when token is refreshed
                profileCache = null;

                const userId = getUserIdFromToken(newTokens.accessToken);
                return {
                    user: {
                        id: userId || 'unknown',
                        email: undefined,
                        name: undefined,
                        avatar: undefined,
                    },
                    accessToken: newTokens.accessToken,
                };
            } catch (error) {
                // Refresh failed, return null (user needs to re-authenticate)
                console.error('Failed to refresh token:', error);
                return null;
            }
        }
        return null;
    }

    // Check cache first
    if (profileCache && (Date.now() - profileCache.timestamp) < PROFILE_CACHE_TTL) {
        return {
            user: profileCache.data!,
            accessToken: tokens.accessToken,
        };
    }

    // Fetch user profile from identity endpoint
    try {
        const identityGateway = new ApiIdentityGateway();
        const profile = await identityGateway.getProfile();

        const userData = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            avatar: profile.avatar,
        };

        // Cache the profile
        profileCache = {
            data: userData,
            timestamp: Date.now(),
        };

        return {
            user: userData,
            accessToken: tokens.accessToken,
        };
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Fall back to token-based user info if identity endpoint fails
        const userId = getUserIdFromToken(tokens.accessToken);
        return {
            user: {
                id: userId || 'unknown',
                email: undefined,
                name: undefined,
                avatar: undefined,
            },
            accessToken: tokens.accessToken,
        };
    }
}
