import { useCallback, useEffect, useState } from "react";
import {
  deleteWikiEntry,
  fetchWikiEntry,
  updateWikiEntry,
} from "../api/wiki-api";
import type { WikiEntry, WikiEntryInput } from "../api/wiki-api";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Произошла неизвестная ошибка";
}

export function useWikiEntry(id: number) {
  const [entry, setEntry] = useState<WikiEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEntry = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError("");
    try {
      setEntry(await fetchWikiEntry(id, signal));
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") return;
      setError(errorMessage(loadError));
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    void loadEntry(controller.signal);
    return () => controller.abort();
  }, [loadEntry]);

  const editEntry = useCallback(async (input: WikiEntryInput) => {
    setEntry(await updateWikiEntry(id, input));
  }, [id]);

  const removeEntry = useCallback(async () => {
    await deleteWikiEntry(id);
  }, [id]);

  return {
    entry,
    isLoading,
    error,
    setError,
    editEntry,
    removeEntry,
    retry: () => void loadEntry(),
  };
}
