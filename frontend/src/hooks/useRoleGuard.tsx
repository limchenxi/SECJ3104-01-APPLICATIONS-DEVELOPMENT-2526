import { useMemo } from "react";
import useAuth from "./useAuth";
import type { UserRole } from "../features/Auth/type";

export default function useRoleGuard(roles: UserRole[]) {
  const { isInitialized, user, isLoading } = useAuth();

  const canAccessPage = useMemo(() => {
    if (!isInitialized || isLoading) {
      return false;
    }

    if (!user) {
      // user not login, ignore, useAuth will handle the the login redirection
      return false;
    }

    return roles.includes(user.role);
  }, [isInitialized, user, isLoading])

  return {
    isInitialized,
    isLoading,
    canAccessPage,
  };
}
