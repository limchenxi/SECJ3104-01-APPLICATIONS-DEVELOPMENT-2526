import { Store } from "@tanstack/react-store";
import type { CerapanRecord } from "../type";

export interface CerapanState {
  records: CerapanRecord[];
  isLoading: boolean;
  error?: string;
}

export const cerapanStore = new Store<CerapanState>({
  records: [],
  isLoading: false,
  error: undefined,
});

export const setCerapanLoading = (isLoading: boolean) => {
  cerapanStore.setState((prev) => ({ ...prev, isLoading }));
};

export const setCerapanRecords = (records: CerapanRecord[]) => {
  cerapanStore.setState({
    records,
    isLoading: false,
    error: undefined,
  });
};

export const setCerapanError = (error?: string) => {
  cerapanStore.setState((prev) => ({
    ...prev,
    isLoading: false,
    error,
  }));
};
