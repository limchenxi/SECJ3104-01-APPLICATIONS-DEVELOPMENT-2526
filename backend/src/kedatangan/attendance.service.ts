import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AttendanceRecord } from './attendance.schema';
import { UsersService } from 'src/users/users.service';
import { ClockInDTO } from './dto/clock-in.dto';
import { Cron } from '@nestjs/schedule';
import { Role, User } from 'src/users/schemas/user.schema';
import { ClockOutDTO } from './dto/clock-out.dto';
import { BadRequestException } from '@nestjs/common';
import { ManualEntryDTO } from './dto/manual-entry.dto';

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
  
  private checkForLateness(date: Date): 'HADIR' | 'LEWAT' {
    const eightAM = new Date();
    eightAM.setHours(8, 0, 0, 0);

    return date <= eightAM ? 'HADIR' : 'LEWAT';
  }

  async createManualRecord(dto: ManualEntryDTO) {
    // Always set attendanceDate to midnight UTC
    const dateObj = new Date(dto.date);
    const attendanceDate = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), 0, 0, 0, 0));

    const timeIn = new Date(dto.clockInTime);
    const timeOut = new Date(dto.clockOutTime);

    if (timeOut < timeIn) {
      throw new BadRequestException('Clock-out cannot be before clock-in');
    }

    return this.attendanceModel.findOneAndUpdate(
      {userID: dto.userID, attendanceDate: attendanceDate},
      {
        userID: dto.userID,
        timeIn: timeIn,
        timeOut: timeOut,
        attendanceDate: attendanceDate,
        attendanceType: this.checkForLateness(timeIn)
      },
      {upsert: true, new: true}
    );
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

  async getAllRecords(startDate: Date, endDate: Date) {
    const records = await this.attendanceModel
      .find({
        attendanceDate: {$gte: startDate, $lte: endDate},
      })
      .sort({ attendanceDate: -1 })
      .lean();

    // Fix: select 'name' instead of 'name_id' so teacher.name is available
    const teachers = await this.userModel
      .find({ role: Role.GURU }, 'name')
      .lean();

    return records.map(record => {
      // Ensure both IDs are strings for comparison
      const recordUserId = record.userID?.toString();
      const teacher = teachers.find(teacher => teacher._id.toString() === recordUserId);
      return {
        ...record,
        userName: teacher ? teacher.name : 'Unknown',
      }
    })
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
