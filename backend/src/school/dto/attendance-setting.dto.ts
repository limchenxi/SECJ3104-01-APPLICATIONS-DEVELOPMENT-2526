import { IsString, IsNotEmpty, Matches, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

const TimeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export class AttendanceSettingDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(TimeFormatRegex, {
    message: 'workStartTime must be in HH:MM format.',
  })
  workStartTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(TimeFormatRegex, { message: 'workEndTime must be in HH:MM format.' })
  workEndTime: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  lateThresholdMinutes: number;
}
