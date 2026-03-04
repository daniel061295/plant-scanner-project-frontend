import ResetPasswordForm from "@/features/auth/presentation/components/ResetPasswordForm";
import { Suspense } from "react";

export const metadata = {
    title: "Reset Password | Plant Health App",
    description: "Create a new password for your Plant Health App account.",
};

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f6f8f6] flex items-center justify-center">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
