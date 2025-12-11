import { type JSX } from "react";

export type ActionId = "in" | "out";

export interface Action {
  id: ActionId;
  label: string;
  icon: JSX.Element;
  // Narrowed type for data integrity, which is compatible with the expanded ThemeColor
  color: 'success' | 'error'; 
}

export interface HistoryEntry {
  id: number;
  action: ActionId; // Must be one of the literal strings in ActionId
  timestamp: Date;
}

export interface FormattedHistoryEntry {
  label: string;
  time: string;
  icon: JSX.Element;
  // This will now hold the final string path, e.g., 'success.main'
  colorPath: string; 
}

export interface SnackbarState {
  open: boolean;
  text: string;
}