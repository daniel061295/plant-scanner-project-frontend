"use client";

import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

export default function BackButton() {
    const router = useRouter();
    return (
        <button onClick={() => router.back()} className="bg-transparent border-none flex items-center justify-center p-2 mr-2 text-slate-900 cursor-pointer rounded-full transition-colors duration-200 hover:bg-slate-100">
            <IconArrowLeft size={24} stroke={1.5} />
        </button>
    );
}
