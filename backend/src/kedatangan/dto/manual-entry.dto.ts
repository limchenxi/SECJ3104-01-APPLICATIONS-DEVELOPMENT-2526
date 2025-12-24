import { IsDateString, IsISO8601, IsNotEmpty, isNotEmpty, IsString, isString } from "class-validator";

export class ManualEntryDTO {
    @IsNotEmpty()
    @IsString()
    userID: string;

    @IsString()
    date: string;

    @IsString()
    clockInTime: string;
    
    @IsString()
    clockOutTime: string;
    
}