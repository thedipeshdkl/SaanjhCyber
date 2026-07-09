import { trpc } from "@/providers/trpc";
import { queryClient } from "@/providers/trpc";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { LOGIN_PATH } from "@/const";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
  requireRole?: string[];
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = LOGIN_PATH, requireRole } =
    options ?? {};

  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      // Nuclear option: clear ALL query cache so no stale auth data remains
      queryClient.clear();
      // Force navigation to home
      window.location.href = "/";
    },
    onError: () => {
      // Even if server returns error (e.g. already logged out), clear local state
      queryClient.clear();
      window.location.href = "/";
    },
  });

  const logout = useCallback(() => logoutMutation.mutate(), [logoutMutation]);

  useEffect(() => {
    if (redirectOnUnauthenticated && !isLoading) {
      if (!user) {
        const currentPath = window.location.pathname;
        if (currentPath !== redirectPath) {
          navigate(redirectPath);
        }
      } else if (requireRole && !requireRole.includes(user.role)) {
        navigate("/");
      }
    }
  }, [redirectOnUnauthenticated, isLoading, user, navigate, redirectPath, requireRole]);

  return useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user,
      isLoading: isLoading || logoutMutation.isPending,
      error,
      logout,
      refresh: refetch,
    }),
    [user, isLoading, logoutMutation.isPending, error, logout, refetch],
  );
}
