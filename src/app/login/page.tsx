import LoginForm from '@/features/auth/presentation/components/LoginForm';

export const metadata = {
    title: 'Login - Plant Health App',
    description: 'Identify and heal your plants with AI diagnostics.',
};

export default function LoginPage() {
    return (
        <main>
            <LoginForm />
        </main>
    );
}
