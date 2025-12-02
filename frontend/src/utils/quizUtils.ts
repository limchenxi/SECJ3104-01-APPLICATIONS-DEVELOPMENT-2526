const ArrayOf = Array.isArray;

export function processQuestions(rawQuestions: any[]) {
    if (!ArrayOf(rawQuestions)) return [];

    return rawQuestions.map((q: any, idx: number) => {
        const questionId = q.id || `${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 9)}`;
        const answerText = q.correctAnswer || q.answer; 
        const answerIndex = q.options.findIndex((opt: string) => opt === answerText);

        return {
            id: questionId,
            question: q.question,
            options: q.options,
            answerIndex: answerIndex >= 0 ? answerIndex : 0, 
            answer: answerText || "",
            explanation: q.explanation || "",
        };
    });
}