// components/token-validator.tsx
"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { validateAndCleanToken } from "@/actions/token";
import { useRouter } from "next/navigation";

export default function TokenValidator() {
  const { setUser, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        const result = await validateAndCleanToken();

        if (!result.isValid) {
          // Token was invalid and removed
          setUser(null);
          router.refresh(); // Refresh the page to update UI
        }
      }
    };

    validateToken();
  }, [token, setUser, router]);

  return null;
}
