import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

export enum Role {
  GURU = 'GURU',
  PENTADBIR = 'PENTADBIR',
  DEVELOPER = 'DEVELOPER',
}

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

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
