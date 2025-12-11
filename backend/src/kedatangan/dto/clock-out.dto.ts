import { IsNotEmpty, isNotEmpty, IsString, isString } from "class-validator";

export class ClockOutDTO {
    @IsNotEmpty()
    @IsString()
    userID: string;
    

    clockOutTime: string;
}