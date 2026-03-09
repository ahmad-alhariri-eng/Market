// components/auth-token-initializer.tsx
import { getAuthCookie } from "@/lib/server-cookies";
import { AuthProvider } from "@/providers/auth-provider";

export default async function AuthTokenInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAuthCookie();
  return <AuthProvider serverToken={token}>{children}</AuthProvider>;
}
