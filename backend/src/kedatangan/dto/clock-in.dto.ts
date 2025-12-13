import { IsNotEmpty, IsString } from "class-validator";

export class ClockInDTO {
    @IsString()
    @IsNotEmpty()
    userID: string;

    @IsString()
    clockInTime: string;
}