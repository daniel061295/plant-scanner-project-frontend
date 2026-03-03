import { User } from '../entities/User';
import { LoginDTO } from '../../application/dtos/LoginDTO';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface IAuthGateway {
    login(credentials: LoginDTO): Promise<User>;
    refreshToken(refreshToken: string): Promise<AuthTokens>;
    logout(refreshToken: string): Promise<void>;
    verifyToken(token: string): Promise<{ valid: boolean; userId?: string }>;
}
