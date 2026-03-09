"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations("Common");

    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-2xl font-bold">{t("serverError")}</h2>
            <p className="text-muted-foreground">{t("unknownError")}</p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default">
                    {t("actions.tryAgain")}
                </Button>
                <Button onClick={() => (window.location.href = "/")} variant="outline">
                    {t("actions.shopNow")}
                </Button>
            </div>
        </div>
    );
}
