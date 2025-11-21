import useRoleGuard from "../hooks/useRoleGuard";
import type { UserRole } from "../features/Auth/type";
import type { ReactNode } from "react";

export default function RoleGuard({
  roles,
  children,
}: {
  roles: UserRole[];
  children: ReactNode;
}) {
  const { isInitialized, canAccessPage, isLoading } = useRoleGuard(roles);

  if (!isInitialized || isLoading) return <div>Loading...</div>;
  if (!canAccessPage) return <div>Unauthorized</div>;

  return <>{children}</>;
}
