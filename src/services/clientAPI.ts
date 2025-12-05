// path: client/src/services/clientAPI.ts
import { httpGet, httpPost, httpPut } from "@/lib/http";

export const clientAPI = {
  getCurrentUser: () => httpGet("/auth/user/"),
  getTasks: () => httpGet("/tasks/"),
  getTask: (id: string | number) => httpGet(`/tasks/${id}/`),
  createTask: (data: unknown) => httpPost("/tasks/", data),
  updateTask: (id: string | number, data: unknown) => httpPut(`/tasks/${id}/`, data),

  acceptBudget: (id: string | number) => httpPost(`/tasks/${id}/accept-budget/`),
  counterBudget: (id: string | number, amount: number, reason = "") =>
    httpPost(`/tasks/${id}/counter-budget/`, { amount, reason }),
  rejectBudget: (id: string | number) => httpPost(`/tasks/${id}/reject-budget/`),
  withdrawTask: (id: string | number, reason = "") => httpPost(`/tasks/${id}/withdraw/`, { reason }),
  approveTask: (id: string | number) => httpPost(`/tasks/${id}/approve/`),
  requestRevision: (id: string | number, feedback: string) =>
    httpPost(`/tasks/${id}/request-revision/`, { feedback }),

  getMessages: (taskId: string | number) => httpGet(`/tasks/${taskId}/chat/`),
  sendMessage: (taskId: string | number, messageData: unknown) => httpPost(`/tasks/${taskId}/chat/`, messageData),

  getNotifications: () => httpGet("/notifications/"),
  markNotificationRead: (id: string | number) => httpPost(`/notifications/${id}/read/`),
};
export default clientAPI;
