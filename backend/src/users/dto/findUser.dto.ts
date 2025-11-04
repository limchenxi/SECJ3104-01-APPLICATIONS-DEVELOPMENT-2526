import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class FindByEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
