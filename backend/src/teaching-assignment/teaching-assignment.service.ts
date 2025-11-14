import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TeachingAssignment,
  TeachingAssignmentDocument,
} from './schemas/teachingAssignment.schema';
import { CreateTeachingAssignmentDto } from './dto/createTeachingAssignment.dto';

@Injectable()
export class TeachingAssignmentService {
  constructor(
    @InjectModel(TeachingAssignment.name)
    private model: Model<TeachingAssignmentDocument>,
  ) {}

  create(dto: CreateTeachingAssignmentDto) {
    return this.model.create(dto);
  }

  findAll() {
    return this.model
      .find()
      .populate('teacherId')
      .populate('classId')
      .populate('subjectId');
  }

  findByTeacher(teacherId: string) {
    return this.model
      .find({ teacherId })
      .populate('classId')
      .populate('subjectId');
  }

  remove(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
