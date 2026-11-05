import { apiRequest } from "@/shared/api";

export type Task = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = {
  title: string;
  description: string;
  date: string;
  time: string;
};

export function fetchTasks(date: string, signal?: AbortSignal) {
  return apiRequest<Task[]>(`/api/tasks?date=${date}`, { signal });
}

export function createTask(input: TaskInput) {
  return apiRequest<Task>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTask(id: number, input: Partial<TaskInput> & { completed?: boolean }) {
  return apiRequest<Task>(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteTask(id: number) {
  return apiRequest<void>(`/api/tasks/${id}`, { method: "DELETE" });
}
