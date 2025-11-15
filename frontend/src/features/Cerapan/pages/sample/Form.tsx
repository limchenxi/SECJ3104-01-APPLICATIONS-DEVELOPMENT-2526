// src/components/CerapanKendiri.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskDetails, submitSelfEvaluation } from '../api/cerapan-service';
import Form from './Form'; // <-- 1. Import your reusable Form
import type { CerapanRecord } from '../type';

// Define the state for answers
type AnswersState = {
  [key: string]: string; // { questionId: "answer text" }
};

export default function CerapanKendiri() {
  const { id } = useParams<{ id: string }>(); // Get ID from URL
  const navigate = useNavigate();

  const [task, setTask] = useState<CerapanRecord | null>(null);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch task data (questions) on load
  useEffect(() => {
    if (!id) return;
    getTaskDetails(id)
      .then((data) => {
        setTask(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // This function is passed down to the <Form /> component
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // The "brain" logic for submitting the form
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!task) return;
    setSubmitting(true);

    // Convert state {q1: "a1"} to DTO [{questionId: "q1", answer: "a1"}]
    const payload = {
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId: questionId,
        answer: answer,
      })),
    };

    // Check if all questions were answered
    if (payload.answers.length < task.questions_snapshot.length) {
      alert("Sila jawab semua soalan.");
      setSubmitting(false);
      return;
    }

    try {
      await submitSelfEvaluation(id!, payload);
      alert("Hantar Berjaya!");
      navigate('/cerapan'); // Send user back to the list
    } catch (err) {
      console.error("Error submitting evaluation:", err);
      alert("Gagal untuk hantar. Sila cuba lagi.");
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!task) return <div>Tugasan tidak dijumpai.</div>;

  return (
    <div>
      <h1>Borang Cerapan Kendiri</h1>
      <h2>Tempoh: {task.period}</h2>

      <form onSubmit={handleSubmit}>
        {/* 2. Use your reusable Form component */}
        <Form
          questions={task.questions_snapshot}
          answers={answers}
          onAnswerChange={handleAnswerChange}
        />
        
        <button type="submit" disabled={submitting} style={{ marginTop: '20px' }}>
          {submitting ? 'Menghantar...' : 'Hantar Borang'}
        </button>
      </form>
    </div>
  );
}