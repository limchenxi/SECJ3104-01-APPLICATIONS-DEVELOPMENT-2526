import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

export enum Role {
  GURU = 'GURU',
  PENTADBIR = 'PENTADBIR',
  SUPERADMIN = 'SUPERADMIN',
}
@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  ic: string;

  @Prop({ required: true, enum: Gender })
  gender: Gender;

  @Prop({ required: true, type: [String], enum: Role })
  role: Role[];

  @Prop({ required: false })
  contactNumber?: string;

  @Prop({ required: false })
  profilePicture?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
