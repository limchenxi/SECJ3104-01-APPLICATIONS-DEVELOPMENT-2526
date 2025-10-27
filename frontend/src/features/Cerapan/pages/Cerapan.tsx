import { useAuth } from "@/hooks/useAuth";

interface Cerapan {
  _id: string;
  teacher: string;
  observer: string;
  date: string;
  remarks: string;
  score: number;
}

export default function CerapanPage() {
  const { role } = useAuth(); // role is either "guru" or "pentadbir"
  const [cerapanList, setCerapanList] = useState<Cerapan[]>([]);
const [selectedCerapan, setSelectedCerapan] = useState<Cerapan | null>(null);
const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
const [formData, setFormData] = useState<CerapanForm>({
  teacher: "",
  observer: "",
  date: "",
  remarks: "",
  score: 0,
});

  return (
    <div>
      <h1>Cerapan</h1>
      {role === "pentadbir" ? (
        <p>Semua cerapan guru</p>
      ) : (
        <p>Cerapan kendiri</p>
      )}
    </div>
  );
}
