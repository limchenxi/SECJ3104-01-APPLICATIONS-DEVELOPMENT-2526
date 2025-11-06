export interface Profile {
  id: string;
  name: string;
  email: string;
  role: "guru" | "pentadbir"| "developer";
  school?: string;
  subject?: string;
  profilePicture?: string;
}