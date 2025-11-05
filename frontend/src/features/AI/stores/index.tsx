import { Store } from "@tanstack/react-store";
import type { AIGeneratedItem } from "../type";

export interface AIState {
  items: AIGeneratedItem[];
  isLoading: boolean;
  error?: string;
}

export const aiStore = new Store<AIState>({
  items: [],
  isLoading: false,
  error: undefined,
});

export const setAILoading = (isLoading: boolean) => {
  aiStore.setState((prev) => ({ ...prev, isLoading }));
};

export const setAIItems = (items: AIGeneratedItem[]) => {
  aiStore.setState({
    items,
    isLoading: false,
    error: undefined,
  });
};

export const setAIError = (error?: string) => {
  aiStore.setState((prev) => ({
    ...prev,
    isLoading: false,
    error,
  }));
};
