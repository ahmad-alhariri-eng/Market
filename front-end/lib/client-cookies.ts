// lib/client-cookies.ts
'use client';

export function setClientCookie(name: string, value: string, days = 7) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

export function getClientCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

export function deleteClientCookie(name: string) {
  document.cookie = `${name}=; Max-Age=-99999999; path=/`;
}