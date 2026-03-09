// app/actions/auth.ts
"use server";

import { deleteAuthCookie, setAuthCookie } from "@/lib/server-cookies";
import { authService } from "@/services/authService";
import { LoginData } from "@/types/auth";

export async function loginAction(loginData: LoginData) {
  const result = await authService.login(loginData);

  if (result.token) {
    // Set HTTP-only cookie with the token
    await setAuthCookie(result.token);
  }

  return result;
}

export async function logoutAction(token?: string) {
  try {
    // Call the logout API if we have a token
    if (token) {
      await authService.logout(token);
    }
  } catch (error) {
    console.error("Logout API call failed:", error);
    // Continue with cookie deletion even if API call fails
  } finally {
    // Delete the HTTP-only cookie (server-side)
    await deleteAuthCookie();
  }

  return { success: true };
}
