// app/[locale]/admin/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/admin/dashboard");
    }, [router]);

    return null;
}
