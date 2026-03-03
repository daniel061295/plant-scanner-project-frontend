import { IAuthGateway } from '../../domain/ports/IAuthGateway';
import { LoginDTO } from '../dtos/LoginDTO';
import { User } from '../../domain/entities/User';
import { AppError } from '@/core/errors/AppError';

export class LoginUseCase {
    constructor(private readonly authGateway: IAuthGateway) { }

    async execute(dto: LoginDTO): Promise<User> {
        if (!dto.email) {
            throw new AppError('Email is required', 400);
        }
        if (!dto.password) {
            throw new AppError('Password is required', 400);
        }

        const user = await this.authGateway.login(dto);

        return user;
    }
}
