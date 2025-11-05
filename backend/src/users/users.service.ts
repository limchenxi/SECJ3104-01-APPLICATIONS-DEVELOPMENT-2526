import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  ic: string;
  gender: 'Male' | 'Female';
  role: 'GURU' | 'PENTADBIR' | 'DEVELOPER';
  contactNumber?: string;
  profilePicture?: string;
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  findById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }

  async countUsers(): Promise<number> {
    return this.userModel.countDocuments();
  }

  async createUser(input: CreateUserInput) {
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = new this.userModel({
      ...input,
      password: hashedPassword,
    });
    return user.save();
  }
}
