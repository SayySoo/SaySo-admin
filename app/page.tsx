"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.push("/admin-auth/login");
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#141a16]">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
    );
}