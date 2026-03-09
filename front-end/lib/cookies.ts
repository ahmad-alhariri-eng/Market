// lib/cookies.ts
import {
  setAuthCookie as setServerCookie,
  getAuthCookie as getServerCookie,
  deleteAuthCookie as deleteServerCookie,
} from "./server-cookies";

export const cookieService = {
  // Server-side methods
  server: {
    set: setServerCookie,
    get: getServerCookie,
    delete: deleteServerCookie,
  },

  // Client-side methods (will be imported in client components)
  client: {
    set: async (name: string, value: string, days?: number) => {
      if (typeof window !== "undefined") {
        const { setClientCookie } = await import("./client-cookies");
        setClientCookie(name, value, days);
      }
    },
    get: async (name: string) => {
      if (typeof window !== "undefined") {
        const { getClientCookie } = await import("./client-cookies");
        return getClientCookie(name);
      }
      return undefined;
    },
    delete: async (name: string) => {
      if (typeof window !== "undefined") {
        const { deleteClientCookie } = await import("./client-cookies");
        deleteClientCookie(name);
      }
    },
  },
};
