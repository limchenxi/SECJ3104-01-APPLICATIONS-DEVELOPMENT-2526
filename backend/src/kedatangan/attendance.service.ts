import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AttendanceRecord } from "./attendance.schema";
import { UsersService } from "src/users/users.service";
import { ClockInDTO } from "./dto/clock-in.dto";

@Injectable()
export class AttendanceService {
    constructor(
        @InjectModel(AttendanceRecord.name) private attendanceModel: Model<AttendanceRecord>
    ) {}

    async clockIn(dto: ClockInDTO) {
        const attendanceRecord = new this.attendanceModel({
            userID: dto.userID,
            timeIn: dto.clockInTime,
            attendanceType: this.checkForLateness(dto.clockInTime)
        });

        return attendanceRecord.save();
    }

    async clockout() {
        //TODO: Implement
    }

    checkForLateness(time: string): "HADIR" | "HADIR LEWAT" {
        const currTime: Date = new Date(time);
        const eightAM = new Date();
        eightAM.setHours(8, 0, 0, 0);

        if(currTime > eightAM) {
            return "HADIR LEWAT";
        }
        return "HADIR";
    }


}