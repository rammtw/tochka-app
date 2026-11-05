import { useCallback, useEffect, useState } from "react";
import {
  createWikiEntry,
  deleteWikiEntry,
  fetchWikiEntries,
  updateWikiEntry,
} from "../api/wiki-api";
import type { WikiEntry, WikiEntryInput } from "../api/wiki-api";

function byUpdatedAt(left: WikiEntry, right: WikiEntry) {
  return right.updatedAt.localeCompare(left.updatedAt) || right.id - left.id;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Произошла неизвестная ошибка";
}

export function useWiki() {
  const [entries, setEntries] = useState<WikiEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEntries = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError("");
    try {
      setEntries(await fetchWikiEntries(signal));
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

  const addEntry = useCallback(async (input: WikiEntryInput) => {
    const entry = await createWikiEntry(input);
    setEntries((current) => [entry, ...current]);
  }, []);

  const editEntry = useCallback(async (id: number, input: WikiEntryInput) => {
    const entry = await updateWikiEntry(id, input);
    setEntries((current) => current.map((item) => item.id === id ? entry : item).sort(byUpdatedAt));
  }, []);

  const removeEntry = useCallback(async (id: number) => {
    await deleteWikiEntry(id);
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  return {
    entries,
    isLoading,
    error,
    setError,
    addEntry,
    editEntry,
    removeEntry,
    retry: () => void loadEntries(),
  };
}
