import { apiRequest } from "@/shared/api";

export type WikiEntry = {
  id: number;
  title: string;
  category: string;
  content: string;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WikiEntryInput = {
  title: string;
  category: string;
  content: string;
  password?: string;
  clearPassword?: boolean;
};

export function fetchWikiEntries(signal?: AbortSignal) {
  return apiRequest<WikiEntry[]>("/api/wiki", { signal });
}

export function createWikiEntry(input: WikiEntryInput) {
  return apiRequest<WikiEntry>("/api/wiki", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateWikiEntry(id: number, input: WikiEntryInput) {
  return apiRequest<WikiEntry>(`/api/wiki/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function revealWikiPassword(id: number) {
  return apiRequest<{ password: string }>(`/api/wiki/${id}/reveal`, {
    method: "POST",
  });
}

export function deleteWikiEntry(id: number) {
  return apiRequest<void>(`/api/wiki/${id}`, { method: "DELETE" });
}
