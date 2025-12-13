import { backendClient } from "../../../utils/axios-client";
import type { 
  CerapanRecord, 
  SubmitSelfEvalDto, 
  SubmitObservationDto,
  StartEvaluationDto,
  ReportSummary,
} from "../type";

const client = () => backendClient();

// ===============================================
// === 1. ADMIN (PENTADBIR) FUNCTIONS ===
// ===============================================

/**
 * (ADMIN) Start a new evaluation.
 * POST /cerapan/start
 */
export const startEvaluation = async (
  payload: StartEvaluationDto,
): Promise<CerapanRecord> => {
  const response = await client().post<CerapanRecord>("/cerapan/start", payload);
  return response.data;
};

/**
 * (ADMIN) Get the "To-Do" list of tasks (pending obs 1 or 2).
 * GET /cerapan/admin/tasks
 */
export const getAdminTasks = async (): Promise<CerapanRecord[]> => {
  const response = await client().get<CerapanRecord[]>("/cerapan/admin/tasks");
  return response.data;
};

/**
 * (ADMIN) Submit marks for Observation 1.
 * PUT /cerapan/observation-1/:id
 */
export const submitObservation1 = async (
  id: string,
  payload: SubmitObservationDto,
): Promise<CerapanRecord> => {
  const response = await client().put<CerapanRecord>(
    `/cerapan/observation-1/${id}`,
    payload,
  );
  return response.data;
};

/**
 * (ADMIN) Submit marks for Observation 2.
 * PUT /cerapan/observation-2/:id
 */
export const submitObservation2 = async (
  id: string,
  payload: SubmitObservationDto,
): Promise<CerapanRecord> => {
  const response = await client().put<CerapanRecord>(
    `/cerapan/observation-2/${id}`,
    payload,
  );
  return response.data;
};

/**
 * (ADMIN) Get full evaluation details for observation by id (with questions).
 * GET /cerapan/admin/task/:id
 */
export const getAdminEvaluationDetails = async (
  id: string,
): Promise<CerapanRecord> => {
  const response = await client().get<CerapanRecord>(`/cerapan/admin/task/${id}`);
  return response.data;
};

/**
 * (ADMIN) Get the full details + computed summary for ANY report (no teacher restriction).
 * GET /cerapan/admin/report/:id/summary
 */
export const getAdminReportSummary = async (
  id: string,
): Promise<{ report: CerapanRecord; summary: ReportSummary }> => {
  const response = await client().get<{ report: CerapanRecord; summary: ReportSummary }>(
    `/cerapan/admin/report/${id}/summary`,
  );
  return response.data;
};

// ===============================================
// === 2. TEACHER (GURU) FUNCTIONS ===
// ===============================================

/**
 * (TEACHER) Get the "To-Do" list (pending self-evaluations).
 * GET /cerapan/my-tasks
 */
export const getMyTasks = async (): Promise<CerapanRecord[]> => {
  const response = await client().get<CerapanRecord[]>("/cerapan/my-tasks");
  return response.data;
};

/**
 * (TEACHER) Get the "Report History" (completed or in-progress).
 * GET /cerapan/my-reports
 */
export const getMyReports = async (): Promise<CerapanRecord[]> => {
  const response = await client().get<CerapanRecord[]>("/cerapan/my-reports");
  return response.data;
};

/**
 * (TEACHER) Get the full details of ONE task (to fill out the form).
 * GET /cerapan/task/:id
 */
export const getTaskDetails = async (id: string): Promise<CerapanRecord> => {
  const response = await client().get<CerapanRecord>(`/cerapan/task/${id}`);
  return response.data;
};

/**
 * (TEACHER) Get the full details of ONE report (to view all results).
 * GET /cerapan/report/:id
 */
export const getReportDetails = async (id: string): Promise<CerapanRecord> => {
  const response = await client().get<CerapanRecord>(`/cerapan/report/${id}`);
  return response.data;
};

/**
 * (TEACHER) Get the full details + computed summary for ONE report.
 * GET /cerapan/report/:id/summary
 */
export const getReportSummary = async (
  id: string,
): Promise<{ report: CerapanRecord; summary: ReportSummary }> => {
  const response = await client().get<{ report: CerapanRecord; summary: ReportSummary }>(
    `/cerapan/report/${id}/summary`,
  );
  return response.data;
};

/**
 * (TEACHER) Submit their self-evaluation (cerapan kendiri).
 * PUT /cerapan/self-evaluation/:id
 */
export const submitSelfEvaluation = async (
  id: string,
  payload: SubmitSelfEvalDto,
): Promise<CerapanRecord> => {
  const response = await client().put<CerapanRecord>(
    `/cerapan/self-evaluation/${id}`,
    payload,
  );
  return response.data;
};

/**
 * (TEACHER) Start their own self-evaluation (no teacherId sent; derived from JWT)
 * POST /cerapan/self-start
 */
export const startSelfEvaluation = async (
  payload: Omit<StartEvaluationDto, 'teacherId'> & { templateId: string; period: string; subject: string; class: string },
): Promise<CerapanRecord> => {
  const response = await client().post<CerapanRecord>("/cerapan/self-start", payload);
  return response.data;
};

export function startObservation1ByAdmin(newEvaluationId: string) {
  throw new Error("Function not implemented.");
}

/**
 * (ADMIN) Force regenerate AI Comment.
 * PUT /cerapan/admin/regenerate-comment/:id
 */
export const regenerateAiComment = async (
  id: string
): Promise<CerapanRecord> => {
  const response = await client().put<CerapanRecord>(
    `/cerapan/admin/regenerate-comment/${id}`,
    {} // Empty body
  );
  return response.data;
};

export const getPendingTasksCount = async (): Promise<{ totalPending: number }> => {
  const response = await client().get<{ totalPending: number }>("/cerapan/my-tasks/count");
  return response.data;
};