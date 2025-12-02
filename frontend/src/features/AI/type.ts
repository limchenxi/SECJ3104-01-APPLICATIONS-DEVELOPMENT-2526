export interface AIModule {
  _id: string;
  // Basic
  name: string;          // "Lesson Plan Generator"
  usageTypes: string[];     // "lesson_plan"
  enabled: boolean;
  // Provider
  provider: string;      // "OpenAI"
  model: string;         // "gpt-4.1-mini"
  // Default generation settings
  temperature: number;   // 0.7
  maxToken: number;      // 2000
  timeout: number;       // 20000 (ms)
  description?: string;
  tags?: string[];
  updatedAt: string;
}

export interface AIUsage {
  _id: string;
  userId: string;
  usageType: string;  
  provider: string; 
  model: string;  
  createdAt: string;
  updatedAt: string;
  tokensUsed?: number;
}
export interface UsageCount {
  id: number;
  value: number;
  label: string;
  color?: string;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  count: number;
}

// export interface AIGenerationRequest {
//   module: string;     // AI Module name: "Lesson Plan Generator" or "Quiz Generator"
//   prompt: string;    // User input prompt
//   userId?: string;    
//   overrideModel?: string; // Optional model override: "gpt-4" etc.
// }

// export interface AIGeneratedItem {
//   id: string;
//   module: string;   // "Lesson Plan Generator" or "Quiz Generator"
//   provider: string;  // "OpenAI"
//   model: string;    // "gpt-3.5-turbo" or "gpt-4"
//   title: string;    // Generated content title
//   content: string;    // Generated content (could be text, JSON, etc.)
//   createdAt: string;    
//   tags?: string[];    //["math","algebra","form3"]
// }
