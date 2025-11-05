import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';

export class ProfileDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  ic: string;

  @IsEnum(['Male', 'Female'])
  gender: 'Male' | 'Female';

  @IsEnum(['GURU', 'PENTADBIR', 'DEVELOPER'])
  role: 'GURU' | 'PENTADBIR' | 'DEVELOPER';

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}
