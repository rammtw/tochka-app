import { apiRequest } from "@/shared/api";

export type AuthUser = {
  username: string;
};

type AuthResponse = {
  user: AuthUser;
};

export function fetchSession(signal?: AbortSignal) {
  return apiRequest<AuthResponse>("/api/auth/session", { signal });
}

export function loginRequest(username: string, password: string) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logoutRequest() {
  return apiRequest<void>("/api/auth/logout", { method: "POST" });
}
