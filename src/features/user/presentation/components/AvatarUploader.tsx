'use client';

import React, { useRef, useState, useTransition } from 'react';
import { IconEdit, IconLoader2 } from '@tabler/icons-react';
import { updateAvatarAction } from '../../infrastructure/actions/identity.actions';
import { useRouter } from 'next/navigation';

// ── Image helper ─────────────────────────────────────────────────────────────
const MAX_SIZE = 512;

function cropAndResizeToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const side = Math.min(img.width, img.height);
                const sx = (img.width - side) / 2;
                const sy = (img.height - side) / 2;
                const size = Math.min(side, MAX_SIZE);
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface AvatarUploaderProps {
    currentAvatar?: string;
    displayName: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AvatarUploader({ currentAvatar, displayName }: AvatarUploaderProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(currentAvatar || null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        let base64: string;
        try {
            base64 = await cropAndResizeToBase64(file);
        } catch {
            setError('Could not process image.');
            return;
        }

        // Optimistic preview
        setPreview(base64);

        startTransition(async () => {
            const result = await updateAvatarAction(base64);
            if (!result.success) {
                setError(result.error || 'Failed to update avatar.');
                // Revert preview on failure
                setPreview(currentAvatar || null);
            } else {
                // Refresh server data (profile cache was already busted in the action)
                router.refresh();
            }
        });
    };

    const avatarSrc =
        preview ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=13ec49&color=fff&size=128`;

    return (
        <div className="relative mb-4">
            {/* Avatar circle */}
            <button
                type="button"
                onClick={handleClick}
                disabled={isPending}
                className="relative w-28 h-28 rounded-full bg-slate-200 overflow-hidden shadow-[0_0_0_4px_#ffffff,0_10px_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer focus:outline-none disabled:cursor-wait group"
                aria-label="Change profile photo"
            >
                <img
                    alt="User profile"
                    className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-80"
                    src={avatarSrc}
                />
                {/* Hover overlay */}
                {!isPending && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
            </button>

            {/* Edit / loading badge */}
            <div
                onClick={!isPending ? handleClick : undefined}
                className={`absolute bottom-0 right-0 rounded-full p-1.5 flex items-center justify-center shadow-[0_0_0_4px_#ffffff] transition-colors ${isPending ? 'bg-slate-300 cursor-wait' : 'bg-[#13ec49] text-slate-900 cursor-pointer hover:bg-[#10d441]'}`}
            >
                {isPending
                    ? <IconLoader2 size={14} stroke={2} className="animate-spin text-slate-500" />
                    : <IconEdit size={14} stroke={2} />
                }
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Error toast */}
            {error && (
                <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-red-500 font-medium">
                    {error}
                </p>
            )}
        </div>
    );
}
