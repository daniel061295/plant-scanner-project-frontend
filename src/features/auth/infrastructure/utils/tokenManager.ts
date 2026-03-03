import { cookies } from 'next/headers';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Token expiration time in seconds (15 minutes as per backend config)
const ACCESS_TOKEN_EXPIRY = 15 * 60;

// Refresh token expiration (typically longer, e.g., 7 days)
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60;

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

/**
 * Store JWT tokens in HTTP-only cookies
 */
export async function storeTokens(tokens: TokenPair): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ACCESS_TOKEN_EXPIRY,
        path: '/',
    });

    cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: REFRESH_TOKEN_EXPIRY,
        path: '/',
    });
}

/**
 * Get the access token from cookies
 */
export async function getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;
}

/**
 * Get the refresh token from cookies
 */
export async function getRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null;
}

/**
 * Get both tokens from cookies
 */
export async function getTokens(): Promise<TokenPair | null> {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (!accessToken || !refreshToken) {
        return null;
    }

    return { accessToken, refreshToken };
}

/**
 * Clear all tokens from cookies
 */
export async function clearTokens(): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.delete(ACCESS_TOKEN_COOKIE);
    cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

/**
 * Decode JWT token to check expiration
 * Returns the expiration timestamp in seconds
 */
export function getTokenExpiration(token: string): number | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);
        return payload.exp || null;
    } catch {
        return null;
    }
}

/**
 * Check if the access token is expired or about to expire (within 1 minute)
 */
export function isTokenExpired(token: string, bufferSeconds: number = 60): boolean {
    const exp = getTokenExpiration(token);
    if (!exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return exp - now <= bufferSeconds;
}

/**
 * Get the user ID from the access token
 */
export function getUserIdFromToken(token: string): string | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);
        return payload.user_id || null;
    } catch {
        return null;
    }
}
