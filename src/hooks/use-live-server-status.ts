"use client";

import { useCallback, useEffect, useState } from "react";
import type { ServerStatusDocument } from "@/lib/firebase/server-status-shared";

const refreshIntervalMs = 15000;

export function useLiveServerStatus(initialStatus: ServerStatusDocument) {
  const [status, setStatus] = useState(initialStatus);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch(`/api/server-status?ts=${Date.now()}`, {
        cache: "no-store",
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        return;
      }

      setStatus((await response.json()) as ServerStatusDocument);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refresh, refreshIntervalMs);

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    }

    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh]);

  return { status, isRefreshing, refresh };
}
