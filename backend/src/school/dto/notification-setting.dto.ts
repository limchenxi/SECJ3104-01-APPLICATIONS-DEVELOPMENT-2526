import { IsBoolean, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationSettingDTO {
  @Type(() => Boolean)
  @IsBoolean()
  @IsNotEmpty()
  emailEnabled: boolean;

  @Type(() => Boolean)
  @IsBoolean()
  @IsNotEmpty()
  smsEnabled: boolean;

  @Type(() => Boolean)
  @IsBoolean()
  @IsNotEmpty()
  inAppEnabled: boolean;
}
