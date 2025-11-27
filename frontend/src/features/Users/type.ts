export interface User {
  _id: string;
  name: string;
  email: string;
  gender: "female" | "male";
  ic: string;
  phone?: string;
  role: "guru" | "pentadbir" | "superadmin";
  profilePicture?: string;

  // additional User fields
  password?: string;        // only backend uses
  createdAt?: string;
  updatedAt?: string;
}
