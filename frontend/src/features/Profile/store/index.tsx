import { Store } from "@tanstack/react-store";
import type { Profile } from "../type";

export interface ProfileState {
  data?: Profile;
  isLoading: boolean;
  error?: string;
}

export const profileStore = new Store<ProfileState>({
  data: undefined,
  isLoading: false,
  error: undefined,
});

export const setProfileLoading = (isLoading: boolean) => {
  profileStore.setState((prev) => ({ ...prev, isLoading }));
};

export const setProfile = (data: Profile) => {
  profileStore.setState({ data, isLoading: false, error: undefined });
};

export const setProfileError = (error?: string) => {
  profileStore.setState((prev) => ({ ...prev, isLoading: false, error }));
};

