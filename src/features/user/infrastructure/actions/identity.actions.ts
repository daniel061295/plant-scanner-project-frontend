'use server';

import { ApiIdentityGateway } from '../gateways/ApiIdentityGateway';
import { AppError } from '@/core/errors/AppError';

export interface ProfileResult {
    success: boolean;
    profile?: {
        id: string;
        email: string;
        name: string;
        avatar?: string;
        first_name?: string;
        last_name?: string;
    };
    error?: string;
}

/**
 * Server Action to get current user profile
 */
export async function getUserProfileAction(): Promise<ProfileResult> {
    try {
        const gateway = new ApiIdentityGateway();
        const profile = await gateway.getProfile();

        return {
            success: true,
            profile,
        };
    } catch (error) {
        const errorMessage = error instanceof AppError ? error.message : 'Failed to fetch user profile';
        return {
            success: false,
            error: errorMessage,
        };
    }
}
