import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class, ClassDocument } from './schemas/class.schema';
import { CreateClassDto } from './dto/createClass.dto';
import { UpdateClassDto } from './dto/updateClass.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
  ) {}

  create(dto: CreateClassDto) {
    return this.classModel.create(dto);
  }

  findAll() {
    return this.classModel.find();
  }

  findOne(id: string) {
    return this.classModel.findById(id);
  }

  update(id: string, dto: UpdateClassDto) {
    return this.classModel.findByIdAndUpdate(id, dto, { new: true });
  }

  remove(id: string) {
    return this.classModel.findByIdAndDelete(id);
  }
}
