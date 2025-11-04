import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  name?: string;

  @IsString()
  password: string;

  @IsString()
  role: 'GURU' | 'PENTADBIR' | 'DEVELOPER';

  @IsString()
  gender?: 'male' | 'female' | 'other';

  @IsString()
  ic?: string;

  @IsEmail()
  email?: string;

  @IsString()
  contactNumber?: string;

  @IsString()
  school?: string;

  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}
