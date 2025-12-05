// path: client/src/services/adminApi.ts
import { API_BASE, joinUrl } from "@/lib/http";

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(joinUrl(API_BASE, endpoint), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem("access_token") ? { Authorization: `Bearer ${localStorage.getItem("access_token")}` } : {}),
      ...(options?.headers || {}),
    },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
