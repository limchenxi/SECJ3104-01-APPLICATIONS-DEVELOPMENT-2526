import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { Gender, Role } from './createUser.dto';

export class ProfileDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  ic: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}
