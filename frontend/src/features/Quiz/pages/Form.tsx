import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  Button,
} from "@mui/material";
// import type { QuizDifficulty, QuizGenerationRequest } from "../type";

interface QuizFormProps {
  form: {
    subject: string;
    year: string;
    topic: string;
    difficulty: string;
    numQuestions: number;
  };
  setForm: (value: any) => void;
  loading?: boolean;
  onSubmit: () => void;
}

// interface QuizGeneratorFormProps {
//   initialValues?: QuizGenerationRequest;
//   isSubmitting?: boolean;
//   onSubmit: (values: QuizGenerationRequest) => void | Promise<void>;
// }

// const defaultValues: QuizGenerationRequest = {
//   topic: "",
//   difficulty: "medium",
//   questionCount: 5,
// };

// const difficulties: QuizDifficulty[] = ["easy", "medium", "hard"];

export default function QuizForm({ form, setForm, loading, onSubmit }: QuizFormProps) {
  return (
    <Card sx={{ p: 3, mb: 3 }}>
      {/* <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        📘 Penjana Kuiz
      </Typography> */}

      {/* Subject */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Subjek</InputLabel>
        <Select
          value={form.subject}
          label="Subjek"
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        >
          <MenuItem value="Matematik">Matematik</MenuItem>
          <MenuItem value="Sains">Sains</MenuItem>
          <MenuItem value="BM">Bahasa Melayu</MenuItem>
          <MenuItem value="English">English</MenuItem>
        </Select>
      </FormControl>

      {/* Year */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Tahun</InputLabel>
        <Select
          value={form.year}
          label="Tahun"
          onChange={(e) => setForm({ ...form, year: e.target.value })}
        >
          <MenuItem value="1">Tahun 1</MenuItem>
          <MenuItem value="2">Tahun 2</MenuItem>
          <MenuItem value="3">Tahun 3</MenuItem>
          <MenuItem value="4">Tahun 4</MenuItem>
          <MenuItem value="5">Tahun 5</MenuItem>
          <MenuItem value="6">Tahun 6</MenuItem>
        </Select>
      </FormControl>

      {/* Topic */}
      <TextField
        fullWidth
        label="Topik"
        value={form.topic}
        onChange={(e) => setForm({ ...form, topic: e.target.value })}
        sx={{ mb: 2 }}
      />

      {/* Difficulty */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Kesukaran</InputLabel>
        <Select
          value={form.difficulty}
          label="Kesukaran"
          onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
        >
          <MenuItem value="easy">Mudah</MenuItem>
          <MenuItem value="medium">Sederhana</MenuItem>
          <MenuItem value="hard">Sukar</MenuItem>
        </Select>
      </FormControl>

      {/* Number of Questions */}
      <TextField
        fullWidth
        type="number"
        label="Bilangan Soalan"
        value={form.numQuestions}
        onChange={(e) => setForm({ ...form, numQuestions: Number(e.target.value) })}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        fullWidth
        onClick={onSubmit}
        disabled={loading}
        sx={{ py: 1.2 }}
      >
        Jana
      </Button>
    </Card>
  );
}