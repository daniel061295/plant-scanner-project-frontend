import { IIdentityGateway } from '../../domain/ports/IIdentityGateway';
import { UserProfile } from '../../domain/entities/UserProfile';
import { getAccessToken } from '@/features/auth/infrastructure/utils/tokenManager';
import { AppError } from '@/core/errors/AppError';

export class ApiIdentityGateway implements IIdentityGateway {
    private readonly baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    }

    async getProfile(): Promise<UserProfile> {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            throw new AppError('No access token available', 401);
        }

        try {
            const response = await fetch(`${this.baseUrl}/identity/me/`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new AppError('Authentication required', response.status);
                }
                throw new AppError('Failed to fetch user profile', response.status);
            }

            const data = await response.json();

            return {
                id: data.id || data.user_id,
                email: data.email,
                name: data.name || data.first_name || data.email?.split('@')[0] || 'User',
                avatar: data.avatar,
                first_name: data.first_name,
                last_name: data.last_name,
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Network error while fetching profile', 500);
        }
    }
}
