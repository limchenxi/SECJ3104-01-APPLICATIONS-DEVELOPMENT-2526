import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  findByEmail(email: string): User | null {
    // return this.userModel.findOne({ email }).exec();
    const user = this.users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!user) {
      return { message: 'User not found or invalid password' };
    }
    return user;
  }

  async createUser(
    name: string,
    email: string,
    password: string,
    role: string,
  ) {
    const hashed = await bcrypt.hash(password, 10);
    const user = new this.userModel({ name, email, password: hashed, role });
    return user.save();
  }
}
