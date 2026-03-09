// lib/client-storage.ts
'use client';

import { AuthUser } from '@/types/auth';

export function getClientUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Failed to parse user from localStorage', error);
    return null;
  }
}

export function setClientUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
}

export function removeClientUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
}

export function syncClientUser(callback: (user: AuthUser | null) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'user') {
      callback(e.newValue ? JSON.parse(e.newValue) : null);
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}