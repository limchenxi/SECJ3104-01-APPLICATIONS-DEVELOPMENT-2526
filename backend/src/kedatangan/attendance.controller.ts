import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt.strategy";
import { AttendanceService } from "./attendance.service";
import { ClockInDTO } from "./dto/clock-in.dto";
import { ClockOutDTO } from "./dto/clock-out.dto";

@Controller('attendance')
// @UseGuards(JwtAuthGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @Post('clockin')
    clockIn(@Body() dto: ClockInDTO) {
        return this.attendanceService.clockIn(dto);
    }

    @Put('clockout')
    clockOut(@Body() dto: ClockOutDTO) {
        return this.attendanceService.clockout(dto);
    }

    @Get('/:userId/today')
    getAttendanceToday(@Param('userId') userId: string) {
        return this.attendanceService.getTodayRecord(userId);
    }
}