import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class ClockInDTO {
    @IsString()
    @IsNotEmpty()
    userID: string;

    @IsString()
    clockInTime: string;

    @IsString()
    @IsOptional()
    reason?: string;
}