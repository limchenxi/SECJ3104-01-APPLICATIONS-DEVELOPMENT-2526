export interface Profile {
  id: string;
  name: string;
  email: string;
  role: "guru" | "pentadbir";
  school?: string;
  subject?: string;
  profilePicture?: string;
}