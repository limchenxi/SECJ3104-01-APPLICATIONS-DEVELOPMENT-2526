import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from './schemas/subject.schema';
import { CreateSubjectDto } from './dto/createSubject.dto';
import { UpdateSubjectDto } from './dto/updateSubject.dto';

@Injectable()
export class SubjectService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
  ) {}

  create(dto: CreateSubjectDto) {
    return this.subjectModel.create(dto);
  }

  findAll() {
    return this.subjectModel.find();
  }

  findOne(id: string) {
    return this.subjectModel.findById(id);
  }

  update(id: string, dto: UpdateSubjectDto) {
    return this.subjectModel.findByIdAndUpdate(id, dto, { new: true });
  }

  remove(id: string) {
    return this.subjectModel.findByIdAndDelete(id);
  }
}
