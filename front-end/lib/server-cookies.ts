// lib/server-cookies.ts
import { cookies } from "next/headers";

export async function setAuthCookie(
  token: string,
  maxAge: number = 60 * 60 * 24 * 7
) {
  const c = await cookies();
  c.set({
    name: "auth-token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
    path: "/",
  });
}

export async function getAuthCookie() {
  const c = await cookies();
  return c.get("auth-token")?.value;
}

export async function deleteAuthCookie() {
  const c = await cookies();
  c.delete("auth-token");
}
