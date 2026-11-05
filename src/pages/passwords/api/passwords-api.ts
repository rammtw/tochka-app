import { apiRequest } from "@/shared/api";

export type PasswordEntry = {
  id: number;
  title: string;
  login: string;
  url: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type PasswordEntryInput = {
  title: string;
  login: string;
  url: string;
  notes: string;
  password?: string;
};

export function fetchPasswordEntries(signal?: AbortSignal) {
  return apiRequest<PasswordEntry[]>("/api/passwords", { signal });
}

export function createPasswordEntry(input: PasswordEntryInput) {
  return apiRequest<PasswordEntry>("/api/passwords", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updatePasswordEntry(id: number, input: PasswordEntryInput) {
  return apiRequest<PasswordEntry>(`/api/passwords/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function revealPassword(id: number) {
  return apiRequest<{ password: string }>(`/api/passwords/${id}/reveal`, {
    method: "POST",
  });
}

export function deletePasswordEntry(id: number) {
  return apiRequest<void>(`/api/passwords/${id}`, { method: "DELETE" });
}
