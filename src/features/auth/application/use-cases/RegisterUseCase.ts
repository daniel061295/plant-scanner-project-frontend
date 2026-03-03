import { IAuthGateway } from '../../domain/ports/IAuthGateway';
import { RegisterDTO } from '../dtos/RegisterDTO';
import { User } from '../../domain/entities/User';
import { AppError } from '@/core/errors/AppError';

export class RegisterUseCase {
    constructor(private readonly authGateway: IAuthGateway) { }

    async execute(data: RegisterDTO): Promise<User> {
        if (!data.email || !data.username) {
            throw new AppError('Email and username are required', 400);
        }

        return await this.authGateway.register(data);
    }
}
