import { Body, Controller, Post, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt.strategy";
import { AttendanceService } from "./attendance.service";
import { ClockInDTO } from "./dto/clock-in.dto";

@Controller('attendance')
// @UseGuards(JwtAuthGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @Post('clockin')
    clockIn(@Body() dto: ClockInDTO) {
        return this.attendanceService.clockIn(dto);
    }

    // @Put('clock-out')
    // clockOut() {

    // }
}