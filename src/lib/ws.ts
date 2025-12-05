// path: client/src/lib/ws.ts
export function resolveWsUrl(suffix = "/client/"): string {
  const env = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_WS_URL) || "";
  const base = env.trim().replace(/\/+$/, "");
  const raw = base ? `${base}${suffix}` :
    `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws${suffix}`;
  const url = new URL(raw);
  const token = localStorage.getItem("access_token") || "";
  if (token) url.searchParams.set("token", token); // if backend accepts ?token=
  return url.toString();
}
