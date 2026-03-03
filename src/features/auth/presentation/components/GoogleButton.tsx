"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { loginWithGoogleAction } from "../../infrastructure/actions/auth.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GoogleButton() {
    const router = useRouter();
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        setError(false);
        setErrorMessage("");
        
        if (!credentialResponse.credential) {
            setError(true);
            setErrorMessage("No credential received from Google");
            return;
        }

        const result = await loginWithGoogleAction(credentialResponse.credential);

        if (result.success) {
            router.push("/");
        } else {
            setError(true);
            setErrorMessage(result.error || "Failed to sign in with Google");
        }
    };

    const handleError = () => {
        console.error("[Google Login] Error: Google login failed");
        setError(true);
        setErrorMessage("Failed to sign in with Google");
    };

    return (
        <div className="w-full">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="100%"
            />
            {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
                    {errorMessage.includes("clock") && (
                        <p className="text-red-600 text-xs mt-1">
                            Time synchronization issue. Please try again in a few moments.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
