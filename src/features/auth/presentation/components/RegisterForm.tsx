'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    IconArrowLeft, IconArrowRight,
    IconMail, IconUser, IconLock, IconEye, IconEyeOff, IconUpload
} from '@tabler/icons-react';
import { registerAction } from '../../infrastructure/actions/auth.actions';

// ── Image helpers ─────────────────────────────────────────────────────────────
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

// ── Component ─────────────────────────────────────────────────────────────────
export default function RegisterForm() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarBase64, setAvatarBase64] = useState<string | undefined>(undefined);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const b64 = await cropAndResizeToBase64(file);
            setAvatarPreview(b64);
            setAvatarBase64(b64);
        } catch {
            setError('Could not process image. Please try another one.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await registerAction(email, username, password, avatarBase64);
        setLoading(false);

        if (!result.success) {
            setError(result.error || 'Registration failed. Please try again.');
            return;
        }

        router.push('/login?registered=true');
    };

    return (
        <div className="min-h-screen min-h-[100dvh] bg-[#f6f8f6] font-['Lexend',sans-serif] flex flex-col justify-between overflow-x-hidden antialiased relative">

            {/* ── Back button ── */}
            <div className="absolute top-6 left-6 z-30">
                <Link href="/login" className="flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors">
                    <IconArrowLeft size={24} stroke={1.5} />
                </Link>
            </div>

            {/* ── Hero / illustration area ── */}
            <div className="flex-1 flex flex-col items-center justify-center w-full px-6 pt-12 pb-6 relative">
                {/* Soft green glow behind */}
                <div className="absolute -top-[10%] -left-[20%] w-[150%] h-[60%] bg-gradient-to-b from-[#11d4421a] to-transparent rounded-full blur-[40px] z-0 pointer-events-none" />

                <div className="w-full max-w-sm flex flex-col items-center gap-6 z-10">
                    {/* Avatar upload */}
                    <div className="flex flex-col items-center gap-2">
                        <button
                            type="button"
                            onClick={handleAvatarClick}
                            className="relative w-24 h-24 rounded-full bg-slate-200 overflow-hidden shadow-[0_0_0_4px_#ffffff,0_8px_16px_rgba(0,0,0,0.08)] cursor-pointer group transition-transform active:scale-95"
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 group-hover:text-slate-600 transition-colors gap-1">
                                    <IconUpload size={24} stroke={1.5} />
                                    <span className="text-[9px] font-bold uppercase tracking-wide">Photo</span>
                                </div>
                            )}
                            {avatarPreview && (
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <IconUpload size={20} className="text-white" stroke={1.5} />
                                </div>
                            )}
                        </button>
                        <p className="text-xs text-slate-400">Tap to add a profile photo</p>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>

                    <div className="text-center">
                        <h1 className="text-slate-900 text-3xl font-bold tracking-tight leading-tight m-0">Create Account</h1>
                        <p className="text-slate-600 text-sm font-normal leading-relaxed max-w-[260px] mx-auto mt-1 m-0">
                            Join Plant Health and start diagnosing your plants with AI.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Form panel ── */}
            <div className="w-full bg-white rounded-t-[32px] shadow-[0_-4px_24px_rgba(0,0,0,0.03)] p-8 pb-10 flex flex-col gap-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-md mx-auto">

                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200 text-center">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-900 text-sm font-medium pl-1" htmlFor="reg-email">Email Address</label>
                        <div className="relative flex">
                            <div className="absolute top-0 bottom-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <IconMail size={20} stroke={1.5} />
                            </div>
                            <input
                                id="reg-email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-xl border border-slate-200 bg-[#f6f8f6] text-slate-900 h-14 pl-12 pr-4 text-base transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:border-[#11d442] focus:ring-1 focus:ring-[#11d442]"
                                placeholder="gardener@example.com"
                            />
                        </div>
                    </div>

                    {/* Full Name (sent as username to backend) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-900 text-sm font-medium pl-1" htmlFor="reg-username">Full Name</label>
                        <div className="relative flex">
                            <div className="absolute top-0 bottom-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <IconUser size={20} stroke={1.5} />
                            </div>
                            <input
                                id="reg-username"
                                type="text"
                                autoComplete="name"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full rounded-xl border border-slate-200 bg-[#f6f8f6] text-slate-900 h-14 pl-12 pr-4 text-base transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:border-[#11d442] focus:ring-1 focus:ring-[#11d442]"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-900 text-sm font-medium pl-1" htmlFor="reg-password">Password</label>
                        <div className="relative flex">
                            <div className="absolute top-0 bottom-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <IconLock size={20} stroke={1.5} />
                            </div>
                            <input
                                id="reg-password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border border-slate-200 bg-[#f6f8f6] text-slate-900 h-14 pl-12 pr-12 text-base transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:border-[#11d442] focus:ring-1 focus:ring-[#11d442]"
                                placeholder="Min. 8 characters"
                            />
                            <button
                                type="button"
                                className="absolute top-0 bottom-0 right-0 pr-4 flex items-center text-slate-400 bg-transparent border-none cursor-pointer hover:text-slate-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <IconEye size={20} stroke={1.5} /> : <IconEyeOff size={20} stroke={1.5} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full bg-[#0d3512] text-white h-14 rounded-xl text-base font-semibold border-none flex items-center justify-center gap-2 shadow-[0_10px_15px_-3px_rgba(17,212,66,0.1)] cursor-pointer transition-all duration-200 hover:bg-[#0a2b0e] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <>
                                <span>Create Account</span>
                                <IconArrowRight size={20} stroke={2} />
                            </>
                        )}
                    </button>
                </form>

                {/* Sign in link */}
                <p className="text-center text-slate-600 text-sm max-w-md mx-auto w-full mt-0">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#11d442] font-semibold decoration-2 underline-offset-4 transition-all duration-200 hover:underline">
                        Sign In
                    </Link>
                </p>
                <div style={{ height: '1rem', width: '100%' }} />
            </div>
        </div>
    );
}
