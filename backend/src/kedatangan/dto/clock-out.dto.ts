import { IsNotEmpty, isNotEmpty, IsString, isString, IsOptional } from "class-validator";

export class ClockOutDTO {
    @IsNotEmpty()
    @IsString()
    userID: string;

    @IsString()
    clockOutTime: string;

    @IsString()
    @IsOptional()
    reason?: string;
}