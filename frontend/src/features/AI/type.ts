export interface AIGenerationRequest {
  topic: string;
  objective: string;
  format: "module" | "idea" | "quiz";
}

export interface AIGeneratedItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  tags: string[];
}
