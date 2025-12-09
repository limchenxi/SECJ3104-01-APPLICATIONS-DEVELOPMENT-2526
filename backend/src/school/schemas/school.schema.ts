import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// 1. Basic Info 子文档
class BasicInfo {
  @Prop({ required: true, trim: true, default: 'SK SRI SIAKAP' })
  name: string;

  @Prop({ trim: true, default: 'Simpang Tiga, 34300 Kuala Kurau, Perak' })
  address: string;

  @Prop({ default: 'Asia/Kuala_Lumpur' })
  timezone: string;

  @Prop({ default: 'ms-MY' })
  language: string;

  @Prop({ default: new Date().getFullYear().toString() })
  currentAcademicYear: string; // e.g., '2023/2024'
}

// 2. Observation Setting 子文档 (Cerapan Setting)
class ObservationSetting {
  @Prop({ type: Number, default: 60 })
  defaultDurationMinutes: number; //MINUTE

  @Prop({ type: Number, default: 1 })
  reminderDaysBefore: number;

  @Prop({ default: 'false' })
  enableReminder: boolean;
}

// 3. Attendance Setting 子文档 (打卡设置)
class AttendanceSetting {
  @Prop({ default: '08:00' })
  workStartTime: string; // 上班开始时间 (e.g., '08:00')

  @Prop({ default: '17:00' })
  workEndTime: string; // 下班结束时间 (e.g., '17:00')

  @Prop({ type: Number, default: 15 })
  lateThresholdMinutes: number; // 迟到阈值（分钟）
}

// 4. Notification Setting 子文档
class NotificationSetting {
  @Prop({ default: true })
  emailEnabled: boolean;

  @Prop({ default: false })
  smsEnabled: boolean;

  @Prop({ default: true })
  inAppEnabled: boolean;
}

export type SchoolDocument = School & Document;

@Schema()
export class School {
  @Prop({ unique: true, default: 'SCHOOL_SETTINGS_ID' })
  id: string;

  @Prop({ type: BasicInfo, default: () => ({}) })
  basicInfo: BasicInfo;

  @Prop({ type: ObservationSetting, default: () => ({}) })
  observationSetting: ObservationSetting;

  @Prop({ type: AttendanceSetting, default: () => ({}) })
  attendanceSetting: AttendanceSetting;

  @Prop({ type: NotificationSetting, default: () => ({}) })
  notificationSetting: NotificationSetting;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
