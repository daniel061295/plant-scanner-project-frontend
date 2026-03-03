import { UserProfile } from '../entities/UserProfile';

export interface IIdentityGateway {
    getProfile(): Promise<UserProfile>;
}
