// path: client/src/lib/http.ts
type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

function readApiBase(): string {
  const raw =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
    (process.env.REACT_APP_API_URL as string) ||
    "";
  // Local default keeps dev working without changing your backend
  if (!raw) return "/api";
  return raw.trim().replace(/\/+$/, ""); // strip trailing slashes
}

export function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, "");
  const p0 = path.startsWith("/") ? path : `/${path}`;
  // Guard: convert '/api/xyz' -> '/xyz' so `${b}` being '/api' won't produce '/api/api/...'
  const p = p0.replace(/^\/api\/(.*)$/i, "/$1");
  return `${b}${p}`;
}

export const API_BASE = readApiBase();

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
}

async function parseJson(res: Response) {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `API error: ${res.status} ${res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  return res.json();
}

export async function http<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const url = joinUrl(API_BASE, path);
  const res = await fetch(url, {
    credentials: "include",
    headers: { ...authHeaders(), ...(init.headers || {}) },
    ...init,
  });
  return parseJson(res) as Promise<T>;
}

export const httpGet = <T = unknown>(path: string) => http<T>(path);
export const httpPost = <T = unknown>(path: string, body?: Json) =>
  http<T>(path, { method: "POST", body: body == null ? undefined : JSON.stringify(body) });
export const httpPut = <T = unknown>(path: string, body?: Json) =>
  http<T>(path, { method: "PUT", body: body == null ? undefined : JSON.stringify(body) });

// Optional: quick debug at startup
export function logApiBase() {
  // eslint-disable-next-line no-console
  console.info("[BOOT] API_BASE =", API_BASE);
}
