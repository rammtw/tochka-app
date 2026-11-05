import { useCallback, useEffect, useState } from "react";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from "../api/tasks-api";
import type { Task, TaskInput } from "../api/tasks-api";

function byTime(left: Task, right: Task) {
  return left.time.localeCompare(right.time) || left.id - right.id;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Произошла неизвестная ошибка";
}

export function useTasks(date: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError("");
    try {
      const result = await fetchTasks(date, signal);
      setTasks(result);
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") return;
      setError(errorMessage(loadError));
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    const controller = new AbortController();
    void loadTasks(controller.signal);
    return () => controller.abort();
  }, [loadTasks]);

  const addTask = useCallback(async (input: TaskInput) => {
    const task = await createTask(input);
    setTasks((current) => [...current, task].sort(byTime));
  }, []);

  const editTask = useCallback(async (id: number, input: TaskInput) => {
    const task = await updateTask(id, input);
    setTasks((current) =>
      current
        .filter((item) => item.id !== id || task.date === date)
        .map((item) => (item.id === id ? task : item))
        .sort(byTime),
    );
  }, [date]);

  const toggleTask = useCallback(async (task: Task) => {
    const completed = !task.completed;
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, completed } : item)),
    );
    try {
      const updated = await updateTask(task.id, { completed });
      setTasks((current) => current.map((item) => item.id === task.id ? updated : item));
    } catch (toggleError) {
      setTasks((current) =>
        current.map((item) => item.id === task.id ? { ...item, completed: !completed } : item),
      );
      setError(errorMessage(toggleError));
    }
  }, []);

  const removeTask = useCallback(async (id: number) => {
    await deleteTask(id);
    setTasks((current) => current.filter((task) => task.id !== id));
  }, []);

  return {
    tasks,
    isLoading,
    error,
    addTask,
    editTask,
    toggleTask,
    removeTask,
    retry: () => void loadTasks(),
  };
}
