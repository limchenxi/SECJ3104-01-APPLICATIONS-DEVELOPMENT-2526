import { Store } from "@tanstack/react-store";
import type {
  ActivityItem,
  SummaryStat,
} from "../api/dashboardService";

export interface DashboardState {
  stats: SummaryStat[];
  activities: ActivityItem[];
  isLoading: boolean;
  error?: string;
}

export const dashboardStore = new Store<DashboardState>({
  stats: [],
  activities: [],
  isLoading: false,
  error: undefined,
});

export const setDashboardLoading = (isLoading: boolean) => {
  dashboardStore.setState((prev) => ({ ...prev, isLoading }));
};

export const setDashboardData = (
  stats: SummaryStat[],
  activities: ActivityItem[],
) => {
  dashboardStore.setState({
    stats,
    activities,
    isLoading: false,
    error: undefined,
  });
};

export const setDashboardError = (error?: string) => {
  dashboardStore.setState((prev) => ({
    ...prev,
    isLoading: false,
    error,
  }));
};
