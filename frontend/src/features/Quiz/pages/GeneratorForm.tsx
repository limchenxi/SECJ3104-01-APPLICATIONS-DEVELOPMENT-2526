import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { QuizDifficulty, QuizGenerationRequest } from "../api/quizService";

interface QuizGeneratorFormProps {
  initialValues?: QuizGenerationRequest;
  isSubmitting?: boolean;
  onSubmit: (values: QuizGenerationRequest) => void | Promise<void>;
}

const defaultValues: QuizGenerationRequest = {
  topic: "",
  difficulty: "medium",
  questionCount: 5,
};

const difficulties: QuizDifficulty[] = ["easy", "medium", "hard"];

export default function QuizGeneratorForm({
  initialValues = defaultValues,
  isSubmitting = false,
  onSubmit,
}: QuizGeneratorFormProps) {
  const [values, setValues] =
    useState<QuizGenerationRequest>(initialValues);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]:
        name === "questionCount" ? Number.parseInt(value, 10) || 0 : value,
    }));
  };

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    setValues((prev) => ({
      ...prev,
      difficulty: event.target.value as QuizDifficulty,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          name="topic"
          label="Topik"
          value={values.topic}
          onChange={handleChange}
          required
        />

        <FormControl>
          <InputLabel id="quiz-difficulty-label">Tahap</InputLabel>
          <Select
            labelId="quiz-difficulty-label"
            value={values.difficulty}
            label="Tahap"
            onChange={handleDifficultyChange}
          >
            {difficulties.map((difficulty) => (
              <MenuItem key={difficulty} value={difficulty}>
                {difficulty}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          name="questionCount"
          label="Jumlah Soalan"
          type="number"
          value={values.questionCount}
          onChange={handleChange}
          inputProps={{ min: 1, max: 20 }}
          required
        />

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Menjana..." : "Jana Kuiz"}
        </Button>
      </Stack>
    </Box>
  );
}
