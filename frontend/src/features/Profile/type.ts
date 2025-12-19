import type { UserRole } from "../Users/type";

export interface Profile {
  id: string;
  name: string;
  email: string;
  gender: "Male" | "Female";
  ic: string;
  contactNumber?: string;
  role: UserRole[];
  profilePicture?: string;
}
