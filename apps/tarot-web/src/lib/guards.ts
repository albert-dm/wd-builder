/**
 * Auth guard utilities for protecting routes.
 */

import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAuthStatus } from "./auth";

interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  needsProfileCompletion: boolean;
}

/**
 * Hook to check authentication status and redirect if not authenticated.
 * Use in protected routes.
 */
export function useAuthGuard() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    needsProfileCompletion: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const status = await getAuthStatus();

        if (cancelled) return;

        if (!status.user) {
          router.navigate({ to: "/" });
          return;
        }

        setState({
          user: status.user,
          loading: false,
          needsProfileCompletion: status.needsProfileCompletion,
        });
      } catch (err) {
        if (cancelled) return;
        console.error("Auth guard error:", err);
        router.navigate({ to: "/" });
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return state;
}
