import { type JSX } from "react";

export type ActionId = "in" | "out";
export type HistoryRange = "today" | "7d" | "30d";
export type HistoryRangeDetails = { id: HistoryRange; label: string; days: number };
export type HistoryByDate = Record<string, HistoryEntry[]>;

export interface AttendanceRecord {
  id: string; 
  userID: string;
  timeIn: Date;
  timeOut: Date;
  attendanceType: "HADIR" | "LEWAT";
  attendanceDate: Date;
}

export interface Action {
  id: ActionId;
  label: string;
  icon: JSX.Element;
  // Narrowed type for data integrity, which is compatible with the expanded ThemeColor
  color: 'success' | 'error'; 
}

export interface HistoryEntry {
  id: string;
  action: ActionId; // Must be one of the literal strings in ActionId
  timestamp: Date;
  attendanceType?: "HADIR" | "LEWAT" | "TIDAK HADIR";
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