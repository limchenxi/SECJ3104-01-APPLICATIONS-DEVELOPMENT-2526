// RPHGenerator.tsx variables
const [subject, setSubject] = useState<string>("");
const [topic, setTopic] = useState<string>("");
const [learningOutcome, setLearningOutcome] = useState<string>("");
const [generatedPlan, setGeneratedPlan] = useState<string>("");
const [isGenerating, setIsGenerating] = useState<boolean>(false);

// 如果老师保存
const [savedPlans, setSavedPlans] = useState<RPH[]>([]);