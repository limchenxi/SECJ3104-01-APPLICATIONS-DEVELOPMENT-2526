import { useCallback, useEffect, useState } from "react";

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: unknown;
}

export default function useFetch<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
  }, [fetcher]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    reload: load,
  };
}
