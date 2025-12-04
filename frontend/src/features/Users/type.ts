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
