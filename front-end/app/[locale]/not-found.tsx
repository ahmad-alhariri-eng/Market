import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    const t = useTranslations("Common");

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-4xl font-bold">404</h1>
            <h2 className="text-2xl font-semibold">{t("notFound")}</h2>
            <p className="text-muted-foreground">{t("pageNotFoundDescription", { defaultValue: "The page you are looking for does not exist." })}</p>
            <Link href="/">
                <Button variant="default">{t("actions.shopNow")}</Button>
            </Link>
        </div>
    );
}
