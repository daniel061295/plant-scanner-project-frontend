"use client";

import { logoutAction } from "@/features/auth/infrastructure/actions/auth.actions";
import { IconLogout } from "@tabler/icons-react";

export default function LogoutButton() {
    return (
        <button
            className="flex items-center justify-between p-4 rounded-xl no-underline transition-colors duration-200 font-inherit cursor-pointer w-full group mt-2 bg-red-50 border border-red-100 hover:bg-red-100"
            onClick={() => logoutAction()}
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center transition-colors duration-200 group-hover:bg-red-200">
                    <IconLogout size={20} stroke={2} />
                </div>
                <span className="font-medium text-red-600">Log Out</span>
            </div>
        </button>
    );
}
