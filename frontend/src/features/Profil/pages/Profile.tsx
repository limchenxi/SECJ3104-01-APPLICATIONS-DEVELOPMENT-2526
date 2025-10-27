// Profil.tsx variables
const [profile, setProfile] = useState<UserProfile>({
  name: "",
  email: "",
  role: "",
  school: "",
  avatar: "",
});
const [isEditing, setIsEditing] = useState<boolean>(false);
const [loading, setLoading] = useState<boolean>(false);

interface UserProfile {
  name: string;
  email: string;
  role: "guru" | "pentadbir";
  school?: string;
  avatar?: string;
}
