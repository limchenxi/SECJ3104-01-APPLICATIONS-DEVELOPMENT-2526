import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BasicInfoDTO } from './basic-info.dto';
import { ObservationSettingDTO } from './observation-setting.dto';
import { AttendanceSettingDTO } from './attendance-setting.dto';
import { NotificationSettingDTO } from './notification-setting.dto';

export class UpdateSchoolDTO {
  @IsOptional()
  @ValidateNested()
  @Type(() => BasicInfoDTO)
  basicInfo?: BasicInfoDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => ObservationSettingDTO)
  observationSetting?: ObservationSettingDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => AttendanceSettingDTO)
  attendanceSetting?: AttendanceSettingDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingDTO)
  notificationSetting?: NotificationSettingDTO;
}
