import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender, Role } from '../schemas/user.schema';

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

  @IsArray()
  @IsEnum(Role, { each: true })
  role: Role[];

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}
