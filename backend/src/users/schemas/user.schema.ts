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

  @Prop({ required: true, enum: ['GURU', 'PENTADBIR', 'DEVELOPER'] })
  role: 'GURU' | 'PENTADBIR' | 'DEVELOPER';

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: String, select: false })
  verificationToken: string;

  @Prop({ type: Date, select: false })
  verificationTokenExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
