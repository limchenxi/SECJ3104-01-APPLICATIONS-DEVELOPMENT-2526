import { Store } from "@tanstack/react-store";
import type { UserItem, UsersState } from "../type";

export const usersStore = new Store<UsersState>({
  items: [],
  isLoading: false,
  error: undefined,
});

export const setUsersLoading = (isLoading: boolean) => {
  usersStore.setState((prev) => ({ ...prev, isLoading }));
};

export const setUsers = (items: UserItem[]) => {
  usersStore.setState({
    items,
    isLoading: false,
    error: undefined,
  });
};

export const setUsersError = (error?: string) => {
  usersStore.setState((prev) => ({
    ...prev,
    isLoading: false,
    error,
  }));
};

