import { IAuthGateway, AuthTokens } from '../../domain/ports/IAuthGateway';
import { LoginDTO } from '../../application/dtos/LoginDTO';
import { RegisterDTO } from '../../application/dtos/RegisterDTO';
import { User } from '../../domain/entities/User';
import { AppError } from '@/core/errors/AppError';

export class MockAuthGateway implements IAuthGateway {
    async register(data: RegisterDTO): Promise<User> {
        return {
            id: 'mock-uuid',
            email: data.email,
            name: data.username,
        };
    }

    async login(credentials: LoginDTO): Promise<User> {
        // Mock login logic as requested by the user
        if (credentials.email === 'test@example.com' && credentials.password === 'password') {
            return {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token',
            };
        }
        throw new AppError('Invalid credentials', 401);
    }

    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        // Mock refresh token logic
        if (refreshToken === 'mock_refresh_token') {
            return {
                accessToken: 'mock_access_token_refreshed',
                refreshToken: 'mock_refresh_token',
            };
        }
        throw new AppError('Invalid refresh token', 401);
    }

    async logout(refreshToken: string): Promise<void> {
        // Mock logout - nothing to do
        return Promise.resolve();
    }

    async verifyToken(token: string): Promise<{ valid: boolean; userId?: string }> {
        // Mock token verification
        if (token === 'mock_access_token' || token === 'mock_access_token_refreshed') {
            return { valid: true, userId: '1' };
        }
        return { valid: false };
    }
}
