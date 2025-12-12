import { IsNotEmpty, isNotEmpty, IsString, isString } from "class-validator";

export class ClockOutDTO {
    @IsNotEmpty()
    @IsString()
    userID: string;
    
    @IsString()
    clockOutTime: string;
}