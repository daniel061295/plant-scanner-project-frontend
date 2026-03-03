'use server';

import { getLoginUseCase, getRegisterUseCase } from '@/core/di';
import { ApiAuthGateway } from '../gateways/ApiAuthGateway';
import { storeTokens, clearTokens, getTokens, getRefreshToken, isTokenExpired } from '../utils/tokenManager';
import { AppError } from '@/core/errors/AppError';
import { redirect } from 'next/navigation';
import { clearProfileCache } from '@/core/auth/getSession';
import { revalidatePath } from 'next/cache';

export interface LoginResult {
    success: boolean;
    error?: string;
    user?: {
        id: string;
        email: string;
        name?: string;
    };
}

export interface RegisterResult {
    success: boolean;
    error?: string;
    user?: {
        id: string;
        email: string;
        name?: string;
    };
}

/**
 * Server Action for user registration
 */
export async function registerAction(
    email: string,
    username: string,
    password: string,
    avatar?: string
): Promise<RegisterResult> {
    try {
        if (!email || !username || !password) {
            return { success: false, error: 'Email, username and password are required' };
        }

        const registerUseCase = getRegisterUseCase();
        const user = await registerUseCase.execute({
            email,
            username,
            password,
            role_names: ['free_user'],
            plan_name: 'FREE',
            avatar,
        });

        return {
            success: true,
            user: { id: user.id, email: user.email, name: user.name },
        };
    } catch (error) {
        const errorMessage = error instanceof AppError ? error.message : 'Failed to register';
        return { success: false, error: errorMessage };
    }
}

/**
 * Server Action for user login
 */
export async function loginAction(email: string, password: string): Promise<LoginResult> {
    try {
        if (!email || !password) {
            return {
                success: false,
                error: 'Email and password are required',
            };
        }

        const loginUseCase = getLoginUseCase();
        const user = await loginUseCase.execute({ email, password });

        // Store tokens in HTTP-only cookies
        if (user.accessToken && user.refreshToken) {
            await storeTokens({
                accessToken: user.accessToken,
                refreshToken: user.refreshToken,
            });
        }

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    } catch (error) {
        const errorMessage = error instanceof AppError ? error.message : 'Failed to login';
        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Server Action for user logout
 */
export async function logoutAction(): Promise<void> {
    try {
        const refreshToken = await getRefreshToken();

        if (refreshToken) {
            const authGateway = new ApiAuthGateway();
            await authGateway.logout(refreshToken);
        }
    } catch (error) {
        // Log but don't fail - we want to clear tokens regardless
        console.warn('Logout error (non-blocking):', error);
    } finally {
        clearProfileCache();
        await clearTokens();
        // Bust Next.js router cache so the next user sees a clean slate
        revalidatePath('/');
        revalidatePath('/profile');
        revalidatePath('/history');
    }

    redirect('/login');
}

/**
 * Server Action to get current session
 */
export async function getSessionAction() {
    const tokens = await getTokens();

    if (!tokens) {
        return null;
    }

    // Check if access token is expired
    if (isTokenExpired(tokens.accessToken)) {
        try {
            // Try to refresh the token
            const authGateway = new ApiAuthGateway();
            const newTokens = await authGateway.refreshToken(tokens.refreshToken);

            await storeTokens(newTokens);

            return {
                user: {
                    id: 'user', // Will be extracted from token
                    email: 'user@example.com',
                },
                accessToken: newTokens.accessToken,
            };
        } catch (error) {
            // Refresh failed, clear tokens
            await clearTokens();
            return null;
        }
    }

    return {
        user: {
            id: 'user',
            email: 'user@example.com',
        },
        accessToken: tokens.accessToken,
    };
}

/**
 * Server Action to refresh the access token
 */
export async function refreshTokensAction(): Promise<{ success: boolean; accessToken?: string }> {
    try {
        const tokens = await getTokens();

        if (!tokens) {
            return { success: false };
        }

        if (!isTokenExpired(tokens.accessToken, 300)) {
            // Token still valid for 5+ minutes, no need to refresh
            return { success: true, accessToken: tokens.accessToken };
        }

        const authGateway = new ApiAuthGateway();
        const newTokens = await authGateway.refreshToken(tokens.refreshToken);

        await storeTokens(newTokens);

        return { success: true, accessToken: newTokens.accessToken };
    } catch (error) {
        await clearTokens();
        return { success: false };
    }
}

/**
 * Server Action to get the current access token (for API calls)
 */
export async function getAccessTokenAction(): Promise<string | null> {
    try {
        const tokens = await getTokens();

        if (!tokens) {
            return null;
        }

        // Check if token needs refresh
        if (isTokenExpired(tokens.accessToken, 60)) {
            const authGateway = new ApiAuthGateway();
            const newTokens = await authGateway.refreshToken(tokens.refreshToken);
            await storeTokens(newTokens);
            return newTokens.accessToken;
        }

        return tokens.accessToken;
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
}

/**
 * Server Action for Google OAuth login
 */
export async function loginWithGoogleAction(credential: string): Promise<LoginResult> {
    try {
        if (!credential) {
            return {
                success: false,
                error: 'Google credential is required',
            };
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

        console.log('[Google Login] Sending credential to backend:', baseUrl + '/auth/google/');
        console.log('[Google Login] Credential length:', credential.length);
        console.log('[Google Login] Credential starts with:', credential.substring(0, 50));

        // Send credential to backend Django endpoint
        const response = await fetch(`${baseUrl}/auth/google/`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: credential,
            }),
        });

        console.log('[Google Login] Response status:', response.status);

        const responseText = await response.text();
        console.log('[Google Login] Response body:', responseText);

        if (!response.ok) {
            try {
                const errorData = JSON.parse(responseText);
                throw new AppError(errorData.detail || errorData.message || 'Failed to login with Google', response.status);
            } catch {
                throw new AppError('Failed to login with Google', response.status);
            }
        }

        const data = JSON.parse(responseText);

        // Backend returns { access, refresh } tokens
        if (data.access && data.refresh) {
            await storeTokens({
                accessToken: data.access,
                refreshToken: data.refresh,
            });
        } else {
            throw new AppError('Invalid response from server', 500);
        }

        // Extract user info from access token
        const userId = getUserIdFromJwt(data.access);
        const email = getEmailFromJwt(data.access);

        return {
            success: true,
            user: {
                id: userId || 'unknown',
                email: email || 'user@example.com',
                name: email?.split('@')[0] || 'User',
            },
        };
    } catch (error) {
        const errorMessage = error instanceof AppError ? error.message : 'Failed to login with Google';
        console.error('[Google Login] Error:', error);
        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Helper to extract user ID from JWT token
 */
function getUserIdFromJwt(token: string): string | null {
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

/**
 * Helper to extract email from JWT token
 */
function getEmailFromJwt(token: string): string | null {
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
        return payload.email || null;
    } catch {
        return null;
    }
}
