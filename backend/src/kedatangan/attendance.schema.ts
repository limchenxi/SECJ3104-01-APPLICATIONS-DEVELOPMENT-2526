import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose'
import mongoose from 'mongoose'

@Schema()
export class AttendanceRecord extends mongoose.Document {
    @Prop({required: true})
    userID: string;

    @Prop()
    timeIn: Date;

    @Prop()
    timeOut: Date;

    @Prop()
    attendanceType: "HADIR" | "LEWAT" | "TIDAK HADIR";

    @Prop()
    attendanceDate: Date;
}

export const AttendanceRecordSchema = SchemaFactory.createForClass(AttendanceRecord);