import ForgotPasswordForm from "@/features/auth/presentation/components/ForgotPasswordForm";

export const metadata = {
    title: "Forgot Password | Plant Health App",
    description: "Request a password reset link for your Plant Health App account.",
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}
