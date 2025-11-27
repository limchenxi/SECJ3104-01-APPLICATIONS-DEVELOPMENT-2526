import { backendClient } from "../../../utils/axios-client";
import { setProfile, setProfileError, setProfileLoading } from "../store";
import type { Profile } from "../type";

export async function loadProfile() {
  try {
    setProfileLoading(true);
  // backend exposes the current user's profile at /auth/me
  const res = await backendClient().get("/auth/me");  
    setProfile(res.data);
    return res.data;
  } catch (err) {
    setProfileError("Failed to load profile");
  }
}

export async function updateProfile(data: Partial<Profile>) {
  try {
    setProfileLoading(true);

    const res = await backendClient().patch("/users/me", data); // ✔ 统一 endpoint

    setProfile(res.data);
    return res.data;

  } catch (err) {
    setProfileError("Failed to update profile");
    throw err;
  }
}
