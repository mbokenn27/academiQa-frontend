// path: client/src/services/websocketService.ts
import { resolveWsUrl } from "@/lib/ws";

export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 3000;
  private messageCallbacks = new Map<string, Function[]>();
  private taskCallbacks = new Map<string, Function[]>();

  private buildUrl() { return resolveWsUrl("/client/"); }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    this.socket = new WebSocket(this.buildUrl());
    this.socket.onopen = () => { this.reconnectAttempts = 0; };
    this.socket.onmessage = (e) => this.handleMessage(JSON.parse(e.data));
    this.socket.onclose = () => this.handleReconnect();
    this.socket.onerror = (err) => console.error("WebSocket error:", err);
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectInterval * this.reconnectAttempts);
    }
  }

  private notify(map: Map<string, Function[]>, type: string, payload: any) {
    (map.get(type) || []).forEach((cb) => cb(payload));
  }
  private handleMessage(data: any) {
    switch (data.type) {
      case "task_created": this.notify(this.taskCallbacks, "task_created", data.task); break;
      case "task_updated": this.notify(this.taskCallbacks, "task_updated", data.task); break;
      default: this.notify(this.messageCallbacks, data.type || "message", data);
    }
  }

  onTask(event: string, cb: Function) { const a = this.taskCallbacks.get(event) || []; a.push(cb); this.taskCallbacks.set(event, a); }
  onMessage(event: string, cb: Function) { const a = this.messageCallbacks.get(event) || []; a.push(cb); this.messageCallbacks.set(event, a); }
}
export default new WebSocketService();
