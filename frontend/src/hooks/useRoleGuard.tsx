import { useMemo } from "react";
import useAuth from "./useAuth";
import type { UserRole } from "../features/Users/type";


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

    for (const role of user.role) {
      if (roles.includes(role))
        return true;
    }
    return false;
  }, [isInitialized, user, isLoading, roles])

  return {
    isInitialized,
    isLoading,
    canAccessPage,
  };
}
