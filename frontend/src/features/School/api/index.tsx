import { backendClient } from "../../../utils/axios-client";
import type { SchoolSettings, UpdateSchoolSettingsDTO } from "../type";


const client = backendClient(); 

const SCHOOL_SETTINGS_URL = '/school-settings';

export async function getSchoolSettings(): Promise<SchoolSettings> {
  const response = await client.get(SCHOOL_SETTINGS_URL);
  return response.data;
}

export async function updateSchoolSettings(data: UpdateSchoolSettingsDTO): Promise<SchoolSettings> {
  const response = await client.put(SCHOOL_SETTINGS_URL, data);
  return response.data;
}