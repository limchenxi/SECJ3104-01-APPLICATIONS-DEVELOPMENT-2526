import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeachingAssignment } from './teaching-assignment.schema';
import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto';

@Injectable()
export class TeachingAssignmentService {
  constructor(
    @InjectModel(TeachingAssignment.name)
    private readonly assignmentModel: Model<TeachingAssignment>,
  ) {}

  async create(dto: CreateTeachingAssignmentDto): Promise<TeachingAssignment> {
    const created = new this.assignmentModel(dto);
    return created.save();
  }

  async findAll(filter: Partial<{ academicYear: number; term: string; teacherId: string; subject: string; class: string; active: boolean; }>): Promise<TeachingAssignment[]> {
    return this.assignmentModel.find(filter).sort({ subject: 1, class: 1 }).exec();
  }

  async findById(id: string): Promise<TeachingAssignment> {
    const doc = await this.assignmentModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Teaching assignment not found');
    return doc;
  }

  async update(id: string, dto: UpdateTeachingAssignmentDto): Promise<TeachingAssignment> {
    const updated = await this.assignmentModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Teaching assignment not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.assignmentModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Teaching assignment not found');
  }

  async getForTeacher(teacherId: string, academicYear?: number, term?: string): Promise<TeachingAssignment[]> {
    const query: any = { teacherId, active: true };
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;
    return this.assignmentModel.find(query).sort({ subject: 1, class: 1 }).exec();
  }
}
