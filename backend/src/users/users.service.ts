import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { TeachingAssignment } from '../teaching-assignment/teaching-assignment.schema';

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  ic: string;
  gender: 'Male' | 'Female';
  role: 'GURU' | 'PENTADBIR' | 'DEVELOPER';
  contactNumber?: string;
  profilePicture?: string;
  subjects?: string[];
  classes?: string[];
};

@Injectable()
export class UsersService {
  updateUser(id: any, updateUserDto: UpdateUserDto): any {
    throw new Error('Method not implemented.');
  }
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

  async getAssignments(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      subjects: user.subjects || [],
      classes: user.classes || [],
    };
  }

  async findAll() {
    return this.userModel.find().select('-password').exec();
  }

  async updateAssignments(userId: string, subjects: string[], classes: string[]) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { subjects, classes },
      { new: true },
    ).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
