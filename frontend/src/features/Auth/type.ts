export type UserRole = "GURU" | "PENTADBIR" | "DEVELOPER";

export interface AuthUser {
  id?: string;
  email: string;
  name?: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
