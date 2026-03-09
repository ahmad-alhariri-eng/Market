// lib/api/server.ts
import axios from 'axios';
import { getAuthCookie } from '../server-cookies';

export const serverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

serverApi.interceptors.request.use((config) => {
  const token = getAuthCookie();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

serverApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error.response?.data || error.message);
  }
);