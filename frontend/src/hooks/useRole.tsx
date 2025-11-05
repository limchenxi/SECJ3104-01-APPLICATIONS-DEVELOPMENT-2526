import { useMemo } from "react";
import useAuth from "./useAuth";

export default function useRole() {
  const { user } = useAuth();

  return useMemo(() => user?.role ?? null, [user?.role]);
}
