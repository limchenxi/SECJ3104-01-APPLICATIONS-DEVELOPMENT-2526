import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceRecord, AttendanceRecordSchema } from './attendance.schema';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { UserSchema } from 'src/users/schemas/user.schema';
import { User } from 'src/users/schemas/user.schema';

import { SchoolModule } from '../school/school.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
      { name: User.name, schema: UserSchema },
    ]),
    SchoolModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
