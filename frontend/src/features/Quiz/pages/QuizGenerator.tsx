const [topic, setTopic] = useState<string>("");
const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
const [isGenerating, setIsGenerating] = useState<boolean>(false);