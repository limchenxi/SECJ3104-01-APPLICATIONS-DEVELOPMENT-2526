import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AttendanceRecord } from "./attendance.schema";
import { UsersService } from "src/users/users.service";
import { ClockInDTO } from "./dto/clock-in.dto";
import { Cron } from "@nestjs/schedule";
import { User } from "src/users/schemas/user.schema";

@Injectable()
export class AttendanceService {
    private readonly logger = new Logger(AttendanceService.name);

    constructor(
        @InjectModel(AttendanceRecord.name) private attendanceModel: Model<AttendanceRecord>,
        @InjectModel(User.name) private userModel: Model<User>
    ) {}

    async clockIn(dto: ClockInDTO) {
        const clockInDate = new Date(dto.clockInTime);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingRecord = await this.attendanceModel.findOne({
            userID: dto.userID,
            timeIn: { $gte: today},
        });

        if(existingRecord) {
            return existingRecord;
        }

        const attendanceRecord = new this.attendanceModel({
            userID: dto.userID,
            timeIn: clockInDate,
            attendanceType: this.checkForLateness(clockInDate),
            attendanceDate: today,
        })

        return attendanceRecord.save();
    }

    async clockout() {
        //TODO: Implement
    }

    checkForLateness(date: Date): "HADIR" | "LEWAT" {
        const eightAM = new Date();
        eightAM.setHours(8, 0, 0, 0);

        return date <= eightAM ? "HADIR" : "LEWAT";
    }

    @Cron('59 23 * * *')
    async markAbsentees() {
        this.logger.log('Running daily absentee check');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const users = await this.userModel.find({ role: "GURU" }).lean();

        for(const user of users) {
            const hasRecord = await this.attendanceModel.findOne({
                userID: user._id.toString(),
                timeIn: {$gte: today},
            });

            if(!hasRecord) {
                await this.attendanceModel.create({
                    userID: user._id.toString(),
                    timeIn: null,
                    timeOut:null,
                    attendanceType: 'TIDAK HADIR',
                    attendanceDate: today,
                });

                this.logger.log(`MARKED ABSENT FOR user: ${user._id}`);
            }
        }

        this.logger.log("Absentee checking finished");
    }
}