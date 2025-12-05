// path: src/services/clientAPI.ts

/**
 * REST + WS client helpers.
 * Uses Vite env:
 *  - VITE_API_URL: e.g. '/api' or 'https://api.example.com/api'
 *  - VITE_WS_URL : e.g. 'wss://api.example.com/ws' (optional; auto if absent)
 */

// ------------------------ REST base resolution -------------------------------

function resolveApiBase(): string {
  const raw =
    (typeof import.meta !== "undefined" &&
      (import.meta as any).env?.VITE_API_URL) ||
    (process.env.REACT_APP_API_URL as string) ||
    ""; // CRA fallback if you ever need it

  if (!raw) return "/api";

  const noTrail = raw.trim().replace(/\/+$/, "");

  // If absolute host with no path, append '/api'
  if (/^https?:\/\/[^/]+$/i.test(noTrail)) return `${noTrail}/api`;

  // If it's a path or already has '/api', leave as-is
  return noTrail;
}

// Join base + path safely; strip leading '/api/' from path to avoid duplicates.
function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, "");
  const p0 = path.startsWith("/") ? path : `/${path}`;
  const p = p0.replace(/^\/api\/(.*)$/i, "/$1"); // guard against '/api/api/...'
  return `${b}${p}`;
}

const API_BASE = resolveApiBase();

// ------------------------ WebSocket URL resolution ---------------------------

export function resolveWsUrl(): string {
  const fromEnv =
    (typeof import.meta !== "undefined" &&
      (import.meta as any).env?.VITE_WS_URL) ||
    "";

  const normalized = fromEnv.trim().replace(/\/+$/, "");

  if (normalized) return `${normalized}/client/`; // env provided, ensure trailing '/client/'

  // Auto-compute from current page
  if (typeof window !== "undefined") {
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;
    return `${proto}://${host}/ws/client/`;
  }

  // Server-side render fallback
  return "ws://localhost:8000/ws/client/";
}

// ------------------------ REST helpers ---------------------------------------

const authHeaders = () => ({
  Authorization: localStorage.getItem("access_token")
    ? `Bearer ${localStorage.getItem("access_token")}`
    : "", // avoid 'Bearer null'
  "Content-Type": "application/json",
});

async function handle(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null as unknown as any;
  return res.json();
}

// ------------------------ Public REST API ------------------------------------

export const clientAPI = {
  // Current user
  getCurrentUser: () =>
    fetch(joinUrl(API_BASE, "/auth/user/"), { headers: authHeaders() }).then(handle),

  // Client tasks
  getTasks: () =>
    fetch(joinUrl(API_BASE, "/tasks/"), { headers: authHeaders() }).then(handle),

  getTask: (id: string | number) =>
    fetch(joinUrl(API_BASE, `/tasks/${id}/`), { headers: authHeaders() }).then(handle),

  createTask: (data: unknown) =>
    fetch(joinUrl(API_BASE, "/tasks/"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handle),

  updateTask: (id: string | number, data: unknown) =>
    fetch(joinUrl(API_BASE, `/tasks/${id}/`), {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(handle),

  // Budget negotiation (client)
  acceptBudget: (id: string | number) =>
    fetch(joinUrl(API_BASE, `/tasks/${id}/accept-budget/`), {
      method: "POST",
      headers: authHeaders(),
    }).then(handle),

  counterBudget: (id: string | number, amount: number, reason = "") =>
    fetch(joinUrl(API_BASE, `/tasks/${id}/counter-budget/`), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ amount, reason }),
    }).then(handle),

  rejectBudget: (id: string | number) =>
    fetch(joinUrl(API_BASE, `/tasks/${id}/reject-budget/`), {
      method: "POST",
      headers: authHeaders(),
    }).then(handle),

  withdrawTask: (id: string | number, reason = "") =>
    fetch(joinUrl(API_BASE, `/tasks/${id}/withdraw/`), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ reason }),
    }).then(handle),

  approveTask: (id: string | number) =>
    fetch(joinUrl(API_BASE, `/tasks/${id}/approve/`), {
      method: "POST",
      headers: authHeaders(),
    }).then(handle),

  requestRevision: (id: string | number, feedback: string) =>
    fetch(joinUrl(API_BASE, `/tasks/${id}/request-revision/`), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ feedback }),
    }).then(handle),

  // Chat
  getMessages: (taskId: string | number) =>
    fetch(joinUrl(API_BASE, `/tasks/${taskId}/chat/`), { headers: authHeaders() }).then(handle),

  sendMessage: (taskId: string | number, messageData: unknown) =>
    fetch(joinUrl(API_BASE, `/tasks/${taskId}/chat/`), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(messageData),
    }).then(handle),

  // Notifications
  getNotifications: () =>
    fetch(joinUrl(API_BASE, "/notifications/"), { headers: authHeaders() }).then(handle),

  markNotificationRead: (id: string | number) =>
    fetch(joinUrl(API_BASE, `/notifications/${id}/read/`), {
      method: "POST",
      headers: authHeaders(),
    }).then(handle),
};

export default clientAPI;

// ------------------------ Optional WS helper ---------------------------------

/**
 * getWebSocket: returns a connected WebSocket instance.
 * WHY: Centralizes URL building & keeps a single source of truth.
 */
export function getWebSocket(tokenParamKey = "token"): WebSocket {
  const url = new URL(resolveWsUrl());
  const access = localStorage.getItem("access_token");
  if (access) url.searchParams.set(tokenParamKey, access); // pass JWT via query param
  return new WebSocket(url.toString());
}
