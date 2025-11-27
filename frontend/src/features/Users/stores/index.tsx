import { Store } from "@tanstack/react-store";

export interface UserItem {
  id?: string; // from Mongodb
  _id?: string; // for Datagrid
  name: string;
  email: string;
  role: "GURU" | "PENTADBIR" | "SUPERADMIN";
  ic: string;
  gender: string;
  phone?: string;
  profileImageUrl?: string;
  // Optional teaching assignments
  // subjects?: string[];
  // classes?: string[];
}

export interface UsersState {
  items: UserItem[];
  isLoading: boolean;
  error?: string;
}

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
