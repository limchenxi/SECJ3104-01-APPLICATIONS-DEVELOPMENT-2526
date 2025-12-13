// 1: Basic Info
export type BasicInfo = {
  name: string;
  address: string;
  timezone: string;
  language: string;
  currentAcademicYear: string;
};
// 2: Observation Setting
export type ObservationSetting = {
  defaultDurationMinutes: number;
  reminderDaysBefore: number;
  enableReminder: boolean
};
// 3: Attendance Setting
export type AttendanceSetting = {
  workStartTime: string;
  workEndTime: string;
  lateThresholdMinutes: number;
  automaticallyMarkAbsent: boolean;
};
// 4: Notification Setting
export type NotificationSetting = {
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  retentionDays: number; 
};

export type SchoolSettings = {
  _id: string;
  id: string; 
  basicInfo: BasicInfo;
  observationSetting: ObservationSetting;
  attendanceSetting: AttendanceSetting;
  notificationSetting: NotificationSetting;
  updatedAt: Date;
};

// update
export type UpdateSchoolSettingsDTO = {
  basicInfo?: Partial<BasicInfo>;
  observationSetting?: Partial<ObservationSetting>;
  attendanceSetting?: Partial<AttendanceSetting>;
  notificationSetting?: Partial<NotificationSetting>;
};

export type SettingsKey = keyof UpdateSchoolSettingsDTO;