import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getLoginUseCase } from "@/core/di";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "test@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const loginUseCase = getLoginUseCase();
                    const user = await loginUseCase.execute({
                        email: credentials.email,
                        password: credentials.password,
                    });

                    if (user) {
                        return { id: user.id, email: user.email, name: user.name };
                    }
                    return null;
                } catch (error) {
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development",
};
