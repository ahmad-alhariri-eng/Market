// lib/api/index.ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  // We'll add auth token handling later
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors
    }

    const data = error.response?.data;
    const message = data?.detail || data?.message || error.message || "An unknown error occurred";

    const enhancedError = new Error(typeof message === "string" ? message : JSON.stringify(message));
    // Attach original properties so existing catch blocks checking `error.response` still work
    (enhancedError as any).status = error.response?.status;
    (enhancedError as any).data = data;
    (enhancedError as any).response = error.response;

    return Promise.reject(enhancedError);
  }
);

export * from "./products";
export * from './category-products';
export * from './search';