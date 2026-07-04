import { useEffect, useState } from "react";
import { tokenStorage } from "@/lib/token-storage";

const WARNING_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const CHECK_INTERVAL_MS = 15 * 1000;

/**
 * Polls the stored Access Token expiry and flips `showWarning` on once five
 * minutes or less remain, per RF-HU-007's session monitoring requirement.
 */
export function useSessionMonitor(isAuthenticated: boolean) {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    function check() {
      const expiresAt = tokenStorage.getExpiresAt();
      if (!expiresAt) return;
      const remaining = expiresAt.getTime() - Date.now();
      setShowWarning(remaining <= WARNING_WINDOW_MS);
    }

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return { showWarning, dismissWarning: () => setShowWarning(false) };
}
