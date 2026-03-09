// providers/auth-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthUser } from "@/types/auth";
import {
  getClientUser,
  removeClientUser,
  setClientUser,
} from "@/lib/client-user";
import { authService } from "@/services/authService";
import { logoutAction } from "@/actions/auth";
import { useCookies } from "react-cookie";

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null, token?: string) => void;
  logout: () => Promise<void>;
  token: string | undefined;
};

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
  serverToken?: string;
}

export function AuthProvider({ children, serverToken }: AuthProviderProps) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(serverToken);
  const router = useRouter();
  // Initialize user from local storage
  useEffect(() => {
    const storedUser = getClientUser();
    // Use the server token (HTTP-only cookie)
    if (storedUser && serverToken) {
      setUserState(storedUser);
      setToken(serverToken);
    } else if (storedUser && !serverToken) {
      // NOTE: After login, Next.js soft navigation does not immediately provide the newly set serverToken prop
      // from layout to context. If we blindly remove it here, the user is immediately logged out.
      // We will trust local storage temporarily, until TokenValidator or next hard refresh corrects it if invalid.
      setUserState(storedUser);
      // We don't have the token string, but we know the user is "logged in" based on localStorage
    } else {
      setUserState(null);
      setToken(undefined);
    }
    setIsLoading(false);
  }, [serverToken]);

  const setUser = (newUser: AuthUser | null, newToken?: string) => {
    if (newUser) {
      setClientUser(newUser);
      if (newToken) {
        setToken(newToken);
      }
    } else {
      removeClientUser();
      setToken(undefined);
    }
    setUserState(newUser);
  };

  const logout = async () => {
    try {
      // Call logout API if we have a token
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear HTTP-only cookie using server action
      await logoutAction();

      // Clear local storage items
      removeClientUser();
      localStorage.removeItem("auth-token");

      // Clear state
      setUserState(null);
      setToken(undefined);

      // Redirect to login page
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
