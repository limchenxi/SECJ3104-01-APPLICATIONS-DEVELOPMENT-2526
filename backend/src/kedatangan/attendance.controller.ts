import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt.strategy";
import { AttendanceService } from "./attendance.service";
import { ClockInDTO } from "./dto/clock-in.dto";
import { ClockOutDTO } from "./dto/clock-out.dto";
import { Roles } from "src/auth/roles.decorator";
import { Role } from "src/users/schemas/user.schema";
import { ManualEntryDTO } from "./dto/manual-entry.dto";

const setEndOfDay = (date: Date): Date => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
}

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

    @Get('all')
    @Roles(Role.PENTADBIR, Role.SUPERADMIN)
    getAllAttendance(
        @Query('startDate') startDateStr: string,
        @Query('endDate') endDateStr: string
    ) {
        if (!startDateStr || !endDateStr) {
            throw new BadRequestException('Start and end dates are required');
        }

        const startDate = new Date(startDateStr);
        const endDate = setEndOfDay(new Date(endDateStr));

        return this.attendanceService.getAllRecords(startDate, endDate);
    }

    @Post('manual')
    // @Roles(Role.PENTADBIR, Role.SUPERADMIN)
    async createManualEntry(@Body() dto: ManualEntryDTO) {
        return this.attendanceService.createManualRecord(dto);
    }


    @Get('/:userId/today')
    getAttendanceToday(@Param('userId') userId: string) {
        return this.attendanceService.getTodayRecord(userId);
    }

    @Get("/:userId/history")
    async getAttendanceHistory(
        @Param('userId') userId: string,
        @Query('startDate') startDateStr: string,
        @Query('endDate') endDateStr: string
    ) {
        if(!startDateStr || !endDateStr) {
            throw new BadRequestException('Start date and end date are required');
        }

        const startDate = new Date(startDateStr);
        let endDate = new Date(endDateStr);

        if(isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new BadRequestException('Invalid date format provided. Use YYYY-MM-DD.');
        }

        endDate = setEndOfDay(endDate);

        const records = await this.attendanceService.getRecordsByRange(userId, startDate, endDate);
        return records;
    }
}