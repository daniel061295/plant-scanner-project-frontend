import { User } from '../entities/User';
import { LoginDTO } from '../../application/dtos/LoginDTO';
import { RegisterDTO } from '../../application/dtos/RegisterDTO';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface IAuthGateway {
    login(credentials: LoginDTO): Promise<User>;
    register(data: RegisterDTO): Promise<User>;
    refreshToken(refreshToken: string): Promise<AuthTokens>;
    logout(refreshToken: string): Promise<void>;
    verifyToken(token: string): Promise<{ valid: boolean; userId?: string }>;
    requestPasswordReset(email: string): Promise<boolean>;
    confirmPasswordReset(uid: string, token: string, new_password: string): Promise<boolean>;
}
