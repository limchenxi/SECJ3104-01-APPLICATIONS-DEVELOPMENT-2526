export interface Profile {
  id: string;
  name: string;
  email: string;
  gender: "Male" | "Female";
  ic: string;
  contactNumber?: string;
  role: "GURU" | "PENTADBIR" | "DEVELOPER";
  profilePicture?: string;

  subjectIds?: string[];
  classIds?: string[];
}
