// path: client/src/services/auth.ts
import { httpGet, httpPost } from "@/lib/http";

export interface LoginCredentials { username: string; password: string; }
export interface SignUpData { username: string; email: string; password: string; first_name: string; last_name: string; }
export interface User { id: number; username: string; email: string; first_name: string; last_name: string; role?: string; }

class AuthService {
  async login(credentials: LoginCredentials) {
    const data = await httpPost<{ access: string; refresh: string }>("/token/", credentials);
    localStorage.setItem("access_token", data.access);
    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
    const user = await this.getCurrentUser();
    return { user, access_token: data.access, refresh_token: data.refresh };
    // WHY: ensures token is set before fetching /auth/user/
  }

  async signup(userData: SignUpData) {
    await httpPost("/register/", userData);
    return this.login({ username: userData.username, password: userData.password });
  }

  async getCurrentUser(): Promise<User> {
    const user = await httpGet<User>("/auth/user/");
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  }

  async refreshToken(refreshToken: string) {
    const data = await httpPost<{ access: string; refresh?: string }>("/token/refresh/", { refresh: refreshToken });
    if (data.access) localStorage.setItem("access_token", data.access);
    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
    return { access_token: data.access, refresh_token: data.refresh };
  }

  getToken() { return localStorage.getItem("access_token"); }
  isAuthenticated() { return !!this.getToken(); }
  logout() { ["access_token","refresh_token","user","role"].forEach(k => localStorage.removeItem(k)); }
}
export const authService = new AuthService();
