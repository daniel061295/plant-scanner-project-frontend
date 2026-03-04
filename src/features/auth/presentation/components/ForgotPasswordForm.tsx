"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLeaf, IconMail, IconArrowRight, IconArrowLeft } from "@tabler/icons-react";
import { forgotPasswordAction } from "../../infrastructure/actions/auth.actions";
import Link from "next/link";

export default function ForgotPasswordForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await forgotPasswordAction(email);

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

                {/* Back Button */}
                <div className="absolute top-8 left-6 z-20">
                    <button
                        onClick={() => router.back()}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border-none cursor-pointer transition-colors duration-200 text-slate-700 hover:bg-slate-50"
                    >
                        <IconArrowLeft size={20} stroke={2} />
                    </button>
                </div>

                <div className="w-full max-w-sm flex flex-col items-center gap-8 z-10">
                    <div className="relative flex items-center justify-center w-24 h-24 bg-[#e8f5e9cc] rounded-full backdrop-blur-[4px] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] ring-1 ring-inset ring-[#11d44233]">
                        <IconLeaf size={48} stroke={1.5} className="text-[#11d442]" />
                    </div>
                    <div className="text-center flex flex-col gap-2">
                        <h1 className="text-slate-900 text-3xl font-bold tracking-tight leading-tight m-0">Forgot Password</h1>
                        <p className="text-slate-600 text-base font-normal leading-relaxed max-w-[280px] mx-auto m-0">
                            Enter your email to receive a password reset link.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Area */}
            <div className="w-full bg-white rounded-t-[32px] shadow-[0_-4px_24px_rgba(0,0,0,0.03)] p-8 pb-10 flex flex-col gap-6 animate-slide-up-fade-in">
                {success ? (
                    <div className="flex flex-col gap-5 w-full max-w-md mx-auto items-center text-center py-8">
                        <div className="w-16 h-16 bg-[#e8f5e9] rounded-full flex items-center justify-center mb-2">
                            <IconMail size={32} stroke={1.5} className="text-[#11d442]" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Check your inbox</h2>
                        <p className="text-slate-600">
                            We've sent a password reset link to <strong>{email}</strong>.
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

                        {/* Email Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-medium pl-1" htmlFor="email">Email Address</label>
                            <div className="relative flex">
                                <div className="absolute top-0 bottom-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <IconMail size={20} stroke={1.5} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-200 bg-[#f6f8f6] text-slate-900 h-14 pl-12 pr-4 text-base font-inherit transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:border-[#11d442] focus:ring-1 focus:ring-[#11d442]"
                                    placeholder="gardener@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Action Button */}
                        <button type="submit" disabled={loading} className="mt-4 w-full bg-[#0d3512] text-white h-14 rounded-xl text-base font-semibold border-none flex items-center justify-center gap-2 shadow-[0_10px_15px_-3px_rgba(17,212,66,0.1)] cursor-pointer transition-all duration-200 font-inherit hover:not:disabled:bg-[#0a2b0e] active:not:disabled:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                            <span>{loading ? "Sending..." : "Send Reset Link"}</span>
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
