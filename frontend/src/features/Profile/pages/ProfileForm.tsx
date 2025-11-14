export type ProfileForm = {
  name: string;
  email: string;
  gender: "female" | "male" | "";
  ic: string;
  contactNumber: string;
  role: "guru" | "pentadbir" | "developer" | "";
  profilePicture?: string;
};