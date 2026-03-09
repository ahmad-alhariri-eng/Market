// app/actions/token.ts
"use server";

import { deleteAuthCookie, getAuthCookie } from "@/lib/server-cookies";
import { validateToken } from "@/services/validateToken";
import { authService } from "@/services/authService";
import { redirect } from "next/navigation";

export async function validateAndCleanToken(): Promise<{
  isValid: boolean;
  token?: string;
}> {
  const token = await getAuthCookie();
  
  if (!token) {
    return { isValid: false };
  }

  try {
    const isValid = await validateToken(token);
    
    if (!isValid) {
      // Token is invalid, clean it up
      try {
        await authService.logout(token);
      } catch (error) {
        console.error("Logout API call failed:", error);
      } finally {
        await deleteAuthCookie();
      }
      return { isValid: false };
    }
    
    return { isValid: true, token };
  } catch (error) {
    console.error("Error validating token:", error);
    await deleteAuthCookie();
    return { isValid: false };
  }
}

// Add this new Server Action for token validation only
export async function checkTokenValidity() {
  const token = await getAuthCookie();
  
  if (!token) {
    return { isValid: false };
  }

  try {
    const isValid = await validateToken(token);
    return { isValid, token: isValid ? token : undefined };
  } catch (error) {
    console.error("Error validating token:", error);
    return { isValid: false };
  }
}