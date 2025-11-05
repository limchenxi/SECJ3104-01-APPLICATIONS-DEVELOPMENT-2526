import { Store } from "@tanstack/react-store";
import type { AttendanceRecord } from "../type";

export interface KedatanganState {
  records: AttendanceRecord[];
  isLoading: boolean;
  error?: string;
}

export const kedatanganStore = new Store<KedatanganState>({
  records: [],
  isLoading: false,
  error: undefined,
});

export const setKedatanganLoading = (isLoading: boolean) => {
  kedatanganStore.setState((prev) => ({ ...prev, isLoading }));
};

export const setKedatanganRecords = (records: AttendanceRecord[]) => {
  kedatanganStore.setState((prev) => ({
    ...prev,
    records,
    isLoading: false,
    error: undefined,
  }));
};

export const setKedatanganError = (error?: string) => {
  kedatanganStore.setState((prev) => ({
    ...prev,
    isLoading: false,
    error,
  }));
};
