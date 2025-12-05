import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose'
import mongoose from 'mongoose'

@Schema()
export class AttendanceRecord extends mongoose.Document {
    @Prop({required: true})
    userID: string;

    @Prop()
    timeIn: string;

    @Prop()
    timeOut: string;

    @Prop()
    attendanceType: "HADIR" | "HADIR LAMBAT";
}

export const AttendanceRecordSchema = SchemaFactory.createForClass(AttendanceRecord);