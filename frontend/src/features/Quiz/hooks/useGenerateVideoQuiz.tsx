//x guna
import { useState, useCallback } from "react";
import { useQuizHistory } from "./useQuizHistory";
import { processQuestions } from "../../../utils/quizUtils";

interface VideoGenerationPayload {
    url: string;
    numQuestions: number;
    difficulty: 'easy' | 'medium' | 'hard';
}

export function useGenerateVideoQuiz() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any | null>(null);
    const { reload } = useQuizHistory({ pollInterval: 0 }); 
    
    // 目标 API 路径
    const apiUrl = "/api/quiz/ai/video-quiz"; 

    const generateVideoQuiz = useCallback(async (payload: VideoGenerationPayload) => {
        setLoading(true);
        setError(null);
        setData(null);

        // 🚨 关键修复：只发送 GenerateVideoQuizDto 期望的字段
        const apiBody = {
            url: payload.url,
            questionCount: payload.numQuestions,
        };

        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiBody), 
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Generation failed: Status ${res.status}. ${errorText.substring(0, 100)}...`);
            }
            
            const processedData = await res.json();
            
            // 1. 注入 ID/Index
if          (processedData.questions) {
                processedData.questions = processQuestions(processedData.questions);
            }            
            setData(processedData); 
            
            // 2. 保存历史记录
            const historyType = 'quiz-video';
            const snapshotData = {
                title: `Kuiz Video: ${payload.url}`,
                subject: "Video Content",
                difficulty: payload.difficulty,
                questions: processedData.questions,
            };
            
            await fetch("/api/quiz/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    generatedBy: 'video-quiz-generator',
                    note: `Generated Quiz from URL: ${payload.url}`,
                    snapshot: JSON.stringify(snapshotData),
                    contentType: historyType, 
                }),
            });
            
            reload(); // 刷新历史记录
            return processedData;

        } catch (err: any) {
            setError(err?.message || String(err));
            console.error("VIDEO QUIZ HOOK ERROR:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [reload]);

    return { loading, error, data, generateVideoQuiz };
}