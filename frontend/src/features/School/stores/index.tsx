import { Store } from "@tanstack/react-store"; 
import { getSchoolSettings, updateSchoolSettings } from "../api";
import type { SchoolSettings, SettingsKey, UpdateSchoolSettingsDTO } from "../type";

type SchoolSettingsState = {
  settings: SchoolSettings | null;
  isLoading: boolean;
};

const initialState: SchoolSettingsState = {
  settings: null,
  isLoading: false,
};

// 1. 创建 Store 实例
export const schoolSettingsStore = new Store<SchoolSettingsState>(initialState);

export async function fetchSettings() {
  schoolSettingsStore.setState((state) => ({
    ...state,
    isLoading: true,
  }));

  try {
    const data = await getSchoolSettings();
    // 成功：更新设置和加载状态
    schoolSettingsStore.setState((state) => ({
      ...state,
      settings: data,
      isLoading: false,
    }));
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    schoolSettingsStore.setState((state) => ({
      ...state,
      isLoading: false,
    }));
    throw error; 
  }
}

export async function updatePartialSettings(key: SettingsKey, data: any): Promise<SchoolSettings> {
  const payload: UpdateSchoolSettingsDTO = { [key]: data };
  const currentState = schoolSettingsStore.state;
  const currentSettings = currentState.settings;
  
  // 1. 乐观更新: 先更新本地状态
  if (currentSettings) {
    schoolSettingsStore.setState((state) => ({
      ...state,
      settings: {
        ...currentSettings,
        [key]: {
          ...(currentSettings as any)[key], 
          ...data,
        },
      } as SchoolSettings, 
    }));
  }

  // 2. 调用 API
  try {
    const updatedSettings = await updateSchoolSettings(payload);
    
    // 3. 最终确认更新
    schoolSettingsStore.setState((state) => ({
      ...state,
      settings: updatedSettings,
    }));
    return updatedSettings;
  } catch (error) {
    console.error(`Failed to update ${key}:`, error);
    // 4. 错误回滚: 失败时重新从服务器拉取最新数据
    await fetchSettings(); 
    throw error;
  }
}