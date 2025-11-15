import { Store, useStore } from "@tanstack/react-store";
import { useEffect } from "react";
import { authService } from "../features/Auth/api/authService";
import type { AuthUser } from "../features/Auth/type";
import { getAuthToken, setAuthToken } from "../utils/auth";

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
    return res; 
  };

  const logout = async () => {
    store.setState((prev) => {
      return {
        ...prev,
        user: null,
      }
    });
    setAuthToken(null);
  }

  return {
    isInitialized,
    isLoading,
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };
};

export default useAuth;
