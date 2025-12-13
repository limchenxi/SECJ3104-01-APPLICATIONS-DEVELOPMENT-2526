import {
  IsNumber,
  IsNotEmpty,
  Min,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ObservationSettingDTO {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(5)
  defaultDurationMinutes: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  reminderDaysBefore: number;

  @IsOptional()
  @IsBoolean()
  enableReminder: boolean;
}
