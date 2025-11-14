import { Store } from "@tanstack/react-store";
import type { Profile } from "../type";
import { backendClient } from "../../../utils/axios-client";

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

export const updateProfile = (partialData: Partial<Profile>) => {
  profileStore.setState((prev) => ({
    ...prev,
    data: prev.data ? { ...prev.data, ...partialData } : prev.data,
  }));
};

export async function loadProfile() {
  setProfileLoading(true);
  try {
    const res = await backendClient().get("/users/me"); 
    setProfile(res.data);
  } catch (err) {
    console.error("Failed to load profile:", err);
    setProfileError("Failed to load profile");
  }
}