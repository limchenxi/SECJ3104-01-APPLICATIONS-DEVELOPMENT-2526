import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeachingAssignment } from './teaching-assignment.schema';
import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto';
import { Cerapan } from '../cerapan/cerapan.schema';

@Injectable()
export class TeachingAssignmentService {
  constructor(
    @InjectModel(TeachingAssignment.name)
    private readonly assignmentModel: Model<TeachingAssignment>,
    @InjectModel(Cerapan.name)
    private readonly cerapanModel: Model<Cerapan>,
  ) {}

  async create(dto: CreateTeachingAssignmentDto): Promise<TeachingAssignment> {
    const created = new this.assignmentModel(dto);
    return created.save();
  }

  async findAll(
    filter: Partial<{
      teacherId: string;
      subject: string;
      class: string;
      active: boolean;
    }>,
  ): Promise<TeachingAssignment[]> {
    return this.assignmentModel
      .find(filter)
      .sort({ subject: 1, class: 1 })
      .exec();
  }
  async getAssignmentsByTeacherId(
    teacherId: string,
  ): Promise<{ subjects: string[]; classes: string[] }> {
    const assignments = await this.getForTeacher(teacherId);

    const subjects = [...new Set(assignments.map((a) => a.subject))];
    const classes = [...new Set(assignments.map((a) => a.class))];

    return { subjects, classes };
  }

  async findById(id: string): Promise<TeachingAssignment> {
    const doc = await this.assignmentModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Teaching assignment not found');
    return doc;
  }

  async update(
    id: string,
    dto: UpdateTeachingAssignmentDto,
  ): Promise<TeachingAssignment> {
    const updated = await this.assignmentModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Teaching assignment not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.assignmentModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Teaching assignment not found');
  }

  async getForTeacher(teacherId: string): Promise<TeachingAssignment[]> {
    const query: any = { teacherId, active: true };

    return this.assignmentModel
      .find(query)
      .sort({ subject: 1, class: 1 })
      .exec();
  }

  async getAvailableForCerapan(
    teacherId: string,
    period: string,
  ): Promise<{ subject: string; class: string }[]> {
    // Get all active teaching assignments for the teacher
    const assignments = await this.assignmentModel
      .find({ teacherId, active: true })
      .select('subject class')
      .exec();

    // Get all completed cerapan for this teacher in this period
    const completedCerapan = await this.cerapanModel
      .find({
        teacherId,
        period,
        'self_evaluation.status': 'submitted',
      })
      .select('subject class')
      .exec();

    // Create a set of completed combinations
    const completedSet = new Set(
      completedCerapan.map((c) => `${c.subject}|${c.class}`),
    );

    // Filter out completed assignments
    const available = assignments
      .filter((a) => !completedSet.has(`${a.subject}|${a.class}`))
      .map((a) => ({ subject: a.subject, class: a.class }));

    return available;
  }
}
