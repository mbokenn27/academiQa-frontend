// path: client/src/main.tsx   (✅ Keep, with an optional dev-only log wrapper)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { logApiBase } from "@/lib/http";
import { resolveWsUrl } from "@/lib/ws";

// Optional: gate logs in dev so prod console stays clean
if (import.meta.env.DEV) {
  logApiBase();
  // eslint-disable-next-line no-console
  console.info("[BOOT] WS_URL =", resolveWsUrl("/client/"));
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
