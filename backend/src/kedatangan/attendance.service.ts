import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AttendanceRecord } from './attendance.schema';
import { UsersService } from 'src/users/users.service';
import { ClockInDTO } from './dto/clock-in.dto';
import { Cron } from '@nestjs/schedule';
import { Role, User } from 'src/users/schemas/user.schema';
import { ClockOutDTO } from './dto/clock-out.dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectModel(AttendanceRecord.name)
    private attendanceModel: Model<AttendanceRecord>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async clockIn(dto: ClockInDTO) {
    const clockInDate = new Date(dto.clockInTime);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRecord = await this.attendanceModel.findOne({
      userID: dto.userID,
      timeIn: { $gte: today },
    });

    if (existingRecord) {
      return existingRecord;
    }

    const attendanceRecord = new this.attendanceModel({
      userID: dto.userID,
      timeIn: clockInDate,
      attendanceType: this.checkForLateness(clockInDate),
      attendanceDate: today,
    });

    return attendanceRecord.save();
  }

  async clockout(dto: ClockOutDTO) {
    const clockOutTime = new Date(dto.clockOutTime);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updateRecord = await this.attendanceModel.findOne({
      userID: dto.userID,
      attendanceDate: { $gte: today },
    });

    if (!updateRecord) {
      throw new NotFoundException('No clock in record was found');
    }

    if (updateRecord.timeOut) {
      return updateRecord;
    }

    updateRecord.timeOut = clockOutTime;
    return updateRecord.save();
  }

  async getRecordsByRange(userId: string, startDate: Date, endDate: Date) {
    const records = this.attendanceModel
      .find({
        userID: userId,
        attendanceDate: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ attendanceDate: -1 })
      .lean();

    return records;
  }

  async getRecordsForSpecificDay(userId: string, targetDate: Date) {
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    return this.getRecordsByRange(userId, start, end);
  }

  async getTodayRecord(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const record = await this.attendanceModel
      .findOne({
        userID: userId,
        attendanceDate: {
          $gte: start,
          $lte: end,
        },
      })
      .sort({ timeIn: -1 })
      .lean();

    return record ?? {};
  }

  private checkForLateness(date: Date): 'HADIR' | 'LEWAT' {
    const eightAM = new Date();
    eightAM.setHours(8, 0, 0, 0);

    return date <= eightAM ? 'HADIR' : 'LEWAT';
  }

  @Cron('59 23 * * *')
  async markAbsentees() {
    this.logger.log('Running daily absentee check');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await this.userModel
      .find({ role: { $in: [Role.GURU] } })
      .lean();

    for (const user of users) {
      const hasRecord = await this.attendanceModel.findOne({
        userID: user._id.toString(),
        timeIn: { $gte: today },
      });

      if (!hasRecord) {
        await this.attendanceModel.create({
          userID: user._id.toString(),
          timeIn: null,
          timeOut: null,
          attendanceType: 'TIDAK HADIR',
          attendanceDate: today,
        });

        this.logger.log(`MARKED ABSENT FOR user: ${user._id}`);
      }
    }

    this.logger.log('Absentee checking finished');
  }
}
