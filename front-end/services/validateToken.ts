// lib/auth/validateToken.ts
import { api } from "@/lib/api";

export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await api.get("/profile/me/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // If we get a successful response, the token is valid
    return response.status >= 200 && response.status < 300;
  } catch (error: any) {
    return false;
  }
}
