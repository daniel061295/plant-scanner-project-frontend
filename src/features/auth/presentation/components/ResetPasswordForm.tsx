"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconLock, IconEye, IconEyeOff, IconArrowRight, IconCheck } from "@tabler/icons-react";
import { resetPasswordAction } from "../../infrastructure/actions/auth.actions";
import Link from "next/link";

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [uid, setUid] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Validate parameters on load
    useEffect(() => {
        const uidParam = searchParams.get("uid");
        const tokenParam = searchParams.get("token");

        if (uidParam && tokenParam) {
            setUid(uidParam);
            setToken(tokenParam);
        } else {
            setError("Invalid reset link. Missing uid or token.");
        }
    }, [searchParams]);

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!uid || !token) {
            setError("Missing reset parameters. Please use a valid link from your email.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);
        setError("");

        const result = await resetPasswordAction(uid, token, password);

        if (!result.success) {
            setError(result.error || "Petición fallida.");
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen min-h-[100dvh] bg-[#f6f8f6] font-['Lexend',sans-serif] flex flex-col justify-between overflow-x-hidden antialiased">
            {/* Header / Illustration Area */}
            <div className="flex-1 flex flex-col items-center justify-center w-full p-12 px-6 pt-12 pb-6 relative">
                <div className="absolute -top-[10%] -left-[20%] w-[150%] h-[60%] bg-gradient-to-b from-[#11d4421a] to-transparent rounded-full blur-[40px] z-0 pointer-events-none"></div>

                <div className="w-full max-w-sm flex flex-col items-center gap-8 z-10">
                    <div className="relative flex items-center justify-center w-24 h-24 bg-[#e8f5e9cc] rounded-full backdrop-blur-[4px] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] ring-1 ring-inset ring-[#11d44233]">
                        <IconLock size={48} stroke={1.5} className="text-[#11d442]" />
                    </div>
                    <div className="text-center flex flex-col gap-2">
                        <h1 className="text-slate-900 text-3xl font-bold tracking-tight leading-tight m-0">Reset Password</h1>
                        <p className="text-slate-600 text-base font-normal leading-relaxed max-w-[280px] mx-auto m-0">
                            Please enter your new password below.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Area */}
            <div className="w-full bg-white rounded-t-[32px] shadow-[0_-4px_24px_rgba(0,0,0,0.03)] p-8 pb-10 flex flex-col gap-6 animate-slide-up-fade-in">
                {success ? (
                    <div className="flex flex-col gap-5 w-full max-w-md mx-auto items-center text-center py-8">
                        <div className="w-16 h-16 bg-[#e8f5e9] rounded-full flex items-center justify-center mb-2">
                            <IconCheck size={32} stroke={2} className="text-[#11d442]" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Pasword Updated</h2>
                        <p className="text-slate-600">
                            Your password has been successfully reset. You can now use your new password to log in.
                        </p>
                        <Link
                            href="/login"
                            className="mt-6 w-full bg-[#0d3512] text-white h-14 rounded-xl text-base font-semibold flex items-center justify-center shadow-[0_10px_15px_-3px_rgba(17,212,66,0.1)] transition-transform active:scale-95 no-underline"
                        >
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-md mx-auto">
                        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200 text-center">{error}</div>}
                        {!uid || !token ? (
                            <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm border border-amber-200 text-center">
                                The password reset link seems to be incomplete or invalid. Please check the URL from your email.
                            </div>
                        ) : null}

                        {/* Password Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-medium pl-1" htmlFor="password">New Password</label>
                            <div className="relative flex">
                                <div className="absolute top-0 bottom-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <IconLock size={20} stroke={1.5} />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-200 bg-[#f6f8f6] text-slate-900 h-14 pl-12 pr-12 text-base font-inherit transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:border-[#11d442] focus:ring-1 focus:ring-[#11d442]"
                                    placeholder="••••••••"
                                    required
                                    disabled={!uid || !token}
                                />
                                <button
                                    type="button"
                                    className="absolute top-0 bottom-0 right-0 pr-4 flex items-center text-slate-400 bg-transparent border-none cursor-pointer transition-colors duration-200 hover:text-slate-600 focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <IconEye size={20} stroke={1.5} /> : <IconEyeOff size={20} stroke={1.5} />}
                                </button>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button type="submit" disabled={loading || !uid || !token} className="mt-4 w-full bg-[#0d3512] text-white h-14 rounded-xl text-base font-semibold border-none flex items-center justify-center gap-2 shadow-[0_10px_15px_-3px_rgba(17,212,66,0.1)] cursor-pointer transition-all duration-200 font-inherit hover:not:disabled:bg-[#0a2b0e] active:not:disabled:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                            <span>{loading ? "Saving..." : "Save New Password"}</span>
                            {!loading && <IconArrowRight size={20} stroke={2} />}
                        </button>
                    </form>
                )}

                {/* Bottom Safe Area Spacer for iOS */}
                <div style={{ height: '1rem', width: '100%' }}></div>
            </div>
        </div>
    );
}
