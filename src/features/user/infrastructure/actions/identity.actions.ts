'use server';

import { getAccessTokenAction } from '@/features/auth/infrastructure/actions/auth.actions';
import { AppError } from '@/core/errors/AppError';
import { clearProfileCache } from '@/core/auth/getSession';
import { revalidatePath } from 'next/cache';

export interface UpdateAvatarResult {
    success: boolean;
    avatarUrl?: string;
    error?: string;
}

/**
 * Server Action – upload a new avatar for the current user.
 * @param base64 Full data-URL (e.g. "data:image/jpeg;base64,...") produced by canvas.
 */
export async function updateAvatarAction(base64: string): Promise<UpdateAvatarResult> {
    try {
        const accessToken = await getAccessTokenAction();
        if (!accessToken) {
            return { success: false, error: 'Not authenticated' };
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

        const response = await fetch(`${baseUrl}/identity/me/avatar/`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ avatar: base64 }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new AppError(errorData.detail || 'Failed to update avatar', response.status);
        }

        const data = await response.json();

        // Bust profile cache so the next render fetches fresh data
        clearProfileCache();

        // Invalidate the Next.js route cache for every page that shows the avatar
        revalidatePath('/');
        revalidatePath('/profile');

        return { success: true, avatarUrl: data.avatar };
    } catch (error) {
        const msg = error instanceof AppError ? error.message : 'Failed to update avatar';
        return { success: false, error: msg };
    }
}
