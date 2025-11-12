import { backendClient } from "../../../utils/axios-client";
import type { 
  CerapanRecord, 
  SubmitSelfEvalDto, 
  SubmitObservationDto,
  StartEvaluationDto 
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