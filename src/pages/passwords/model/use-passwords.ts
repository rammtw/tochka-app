import { useCallback, useEffect, useState } from "react";
import {
  createPasswordEntry,
  deletePasswordEntry,
  fetchPasswordEntries,
  revealPassword,
  updatePasswordEntry,
} from "../api/passwords-api";
import type { PasswordEntry, PasswordEntryInput } from "../api/passwords-api";

function byUpdatedAt(left: PasswordEntry, right: PasswordEntry) {
  return right.updatedAt.localeCompare(left.updatedAt) || right.id - left.id;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Произошла неизвестная ошибка";
}

export function usePasswords() {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [passwords, setPasswords] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEntries = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError("");
    try {
      setEntries(await fetchPasswordEntries(signal));
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") return;
      setError(errorMessage(loadError));
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadEntries(controller.signal);
    return () => controller.abort();
  }, [loadEntries]);

  const addEntry = useCallback(async (input: PasswordEntryInput) => {
    const entry = await createPasswordEntry(input);
    setEntries((current) => [entry, ...current]);
  }, []);

  const editEntry = useCallback(async (id: number, input: PasswordEntryInput) => {
    const entry = await updatePasswordEntry(id, input);
    setEntries((current) => current.map((item) => item.id === id ? entry : item).sort(byUpdatedAt));
    setPasswords((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  const reveal = useCallback(async (id: number) => {
    const { password } = await revealPassword(id);
    setPasswords((current) => ({ ...current, [id]: password }));
    return password;
  }, []);

  const hide = useCallback((id: number) => {
    setPasswords((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  const removeEntry = useCallback(async (id: number) => {
    await deletePasswordEntry(id);
    setEntries((current) => current.filter((entry) => entry.id !== id));
    setPasswords((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  return {
    entries,
    passwords,
    isLoading,
    error,
    setError,
    addEntry,
    editEntry,
    reveal,
    hide,
    removeEntry,
    retry: () => void loadEntries(),
  };
}
