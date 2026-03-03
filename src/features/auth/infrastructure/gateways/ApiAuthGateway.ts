import { IAuthGateway, AuthTokens } from '../../domain/ports/IAuthGateway';
import { LoginDTO } from '../../application/dtos/LoginDTO';
import { User } from '../../domain/entities/User';
import { AppError } from '@/core/errors/AppError';

export class ApiAuthGateway implements IAuthGateway {
    private readonly baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    }

    async login(credentials: LoginDTO): Promise<User> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login/`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (response.status === 401 || response.status === 400) {
                    throw new AppError(errorData.detail || 'Invalid credentials', response.status);
                }
                
                throw new AppError(errorData.detail || 'Failed to login', response.status);
            }

            const data = await response.json();

            // API response: { refresh: string, access: string }
            // We need to get user info from the token or make an additional call
            // For now, we extract user info from the access token payload if possible
            // or create a minimal user object with the tokens
            
            const user = this.decodeJwtPayload(data.access);

            return {
                id: user.user_id || this.generateUserIdFromToken(data.access),
                email: credentials.email,
                name: user.email?.split('@')[0] || undefined,
                accessToken: data.access,
                refreshToken: data.refresh,
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Network error while logging in', 500);
        }
    }

    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/refresh/`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh: refreshToken,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new AppError(errorData.detail || 'Failed to refresh token', response.status);
            }

            const data = await response.json();

            // API response: { access: string } - refresh token stays the same
            return {
                accessToken: data.access,
                refreshToken: refreshToken,
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Network error while refreshing token', 500);
        }
    }

    /**
     * Verify if a token is valid using the backend
     * Useful for checking session validity on page load
     */
    async verifyToken(token: string): Promise<{ valid: boolean; userId?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/verify/`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                }),
            });

            if (!response.ok) {
                return { valid: false };
            }

            const data = await response.json();
            
            return {
                valid: true,
                userId: data.user_id
            };
        } catch (error) {
            console.error('Token verification error:', error);
            return { valid: false };
        }
    }

    async logout(refreshToken: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/auth/logout/`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh: refreshToken,
                }),
            });

            // Logout may return 200, 204, or even 401 if token is already expired
            // We consider it successful in most cases as the client should clear tokens anyway
            if (!response.ok && response.status !== 401) {
                console.warn('Logout returned non-200 status:', response.status);
            }
        } catch (error) {
            // Silently fail - client should clear tokens regardless
            console.warn('Logout error (non-blocking):', error);
        }
    }

    /**
     * Decode JWT payload to extract user information
     * Note: This does NOT verify the signature - only decodes the payload
     */
    private decodeJwtPayload(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch {
            return {};
        }
    }

    /**
     * Generate a user ID from the token for fallback identification
     */
    private generateUserIdFromToken(token: string): string {
        const payload = this.decodeJwtPayload(token);
        return payload.user_id || payload.jti || `user_${Date.now()}`;
    }
}
