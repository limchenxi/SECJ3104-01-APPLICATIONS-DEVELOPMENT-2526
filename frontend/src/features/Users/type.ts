export interface User {
  _id: string;
  name: string;
  email: string;
  gender: "Female" | "Male";
  ic: string;
  phone?: string;
  role: "GURU" | "PENTADBIR" | "SUPERADMIN";
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
  gender: "Female" | "Male";
  phone?: string;
  profileImageUrl?: string;
}

export interface UsersState {
  items: UserItem[];
  isLoading: boolean;
  error?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role?: string;
  password?: string;
}
export type UpdateUserPayload = Partial<CreateUserPayload>;
