export type UserRole = "GURU" | "PENTADBIR" | "SUPERADMIN";
export type UserGender = "Male" | "Female";
export interface UserItem {
  _id: string;
  name: string;
  email: string;
  gender: UserGender;
  ic: string;
  role: UserRole[]; 

  phone?: string;
  profilePicture?: string;

  password?: string;        // only backend uses
  createdAt?: string;
  updatedAt?: string;
}

// export interface UserItem {
//   id?: string; // from Mongodb
//   _id?: string; // for Datagrid
//   name: string;
//   email: string;
//   gender: UserGender;
//   role: UserRole[]; 
//   ic: string;
//   phone?: string;
//   profileImageUrl?: string;
// }

export interface UsersState {
  items: UserItem[];
  isLoading: boolean;
  error?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  gender: UserGender;
  ic: string;
  role: UserRole[]; 
  phone?: string;
}
export type UpdateUserPayload = Partial<CreateUserPayload>;

export interface UsersState {
  items: UserItem[];
  isLoading: boolean;
  error?: string;
}
