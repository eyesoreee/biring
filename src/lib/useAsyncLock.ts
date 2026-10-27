import { useCallback, useRef } from "react";

export function useAsyncLock() {
  const locked = useRef(false);

  return useCallback(async (action: () => Promise<void>) => {
    if (locked.current) return;
    locked.current = true;
    try {
      await action();
    } finally {
      locked.current = false;
    }
  }, []);
}
