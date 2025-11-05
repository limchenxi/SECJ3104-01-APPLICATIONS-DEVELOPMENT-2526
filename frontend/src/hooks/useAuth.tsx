import { Store, useStore } from "@tanstack/react-store";
import { useEffect } from "react";
import { authService } from "../features/Auth/api/authService";
import type { AuthUser } from "../features/Auth/type";
import { getAuthToken } from "../utils/auth";

const store = new Store<{
  isInitialized: boolean;
  isLoading: boolean;
  user: AuthUser | null;
}>({
  isInitialized: false,
  isLoading: false,
  user: null,
});

const useAuth = () => {
  const { isInitialized, isLoading, user } = useStore(store);

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    if (!getAuthToken()) {
      store.setState((prev) => ({
        ...prev,
        isInitialized: true,
      }));
      return;
    }

    store.setState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    authService
    .getProfile()
    .then((res) => {
        store.setState((prev) => ({
          ...prev,
          isLoading: false,
          isInitialized: true,
          user: res,
        }));
      })
      .catch((err) => {
        if (err.name === "CanceledError") {
          return;
        }
        store.setState((prev) => ({
          ...prev,
          isLoading: false,
          isInitialized: true,
        }));
      });
  }, [isInitialized]);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    store.setState((prev) => ({
      ...prev,
      user: res.user as AuthUser,
    }));
  };

  return {
    isInitialized,
    isLoading,
    user,
    isAuthenticated: !!user,
    login,
  };
};

export default useAuth;
