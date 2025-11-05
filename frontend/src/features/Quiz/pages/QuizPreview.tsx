import {
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import type { QuizQuestion } from "../api/quizService";

interface QuizPreviewProps {
  questions: QuizQuestion[];
  showAnswers?: boolean;
}

export default function QuizPreview({
  questions,
  showAnswers = false,
}: QuizPreviewProps) {
  if (!questions.length) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">
            Kuiz belum dijana lagi.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {questions.map((question, questionIndex) => (
        <Card key={question.id} variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="subtitle1">
                {questionIndex + 1}. {question.question}
              </Typography>
              <List dense disablePadding>
                {question.options.map((option, optionIndex) => {
                  const isAnswer = optionIndex === question.answerIndex;
                  return (
                    <ListItem key={optionIndex} disableGutters>
                      <ListItemText primary={option} />
                      {showAnswers && isAnswer ? (
                        <Chip label="Jawapan" size="small" color="success" />
                      ) : null}
                    </ListItem>
                  );
                })}
              </List>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
