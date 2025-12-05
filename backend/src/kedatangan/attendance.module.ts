import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AttendanceRecord, AttendanceRecordSchema } from "./attendance.schema";
import { AttendanceService } from "./attendance.service";
import { AttendanceController } from "./attendance.controller";

@Module({
    imports: [
        MongooseModule.forFeature([{name: AttendanceRecord.name, schema: AttendanceRecordSchema}])
    ],
    controllers: [AttendanceController],
    providers: [AttendanceService],
    exports: [AttendanceService]
})
export class AttendanceModule {}