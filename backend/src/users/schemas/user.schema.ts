import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop({ required: true, enum: ['Male', 'Female'] })
  gender: 'Male' | 'Female';

  @Prop({ required: true, enum: ['GURU', 'PENTADBIR', 'DEVELOPER'] })
  role: 'GURU' | 'PENTADBIR' | 'DEVELOPER';

  @Prop({ required: false })
  contactNumber?: string;

  @Prop({ required: false })
  profilePicture?: string;

  // List of subjects the teacher teaches (only relevant when role === 'GURU')
  @Prop({ type: [String], default: [] })
  subjects?: string[];

  // List of classes the teacher teaches (only relevant when role === 'GURU')
  @Prop({ type: [String], default: [] })
  classes?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
