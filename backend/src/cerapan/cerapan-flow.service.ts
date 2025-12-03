import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cerapan } from './cerapan.schema';

@Injectable()
export class CerapanFlowService {
  constructor(
    @InjectModel(Cerapan.name)
    private readonly cerapanModel: Model<Cerapan>,
  ) {}

  // Check if cerapan kendiri, 1, 2 already exist for this teacher/assignment
  async canCreateCerapan(
    teacherId: string,
    subject: string,
    className: string,
    type: 'kendiri' | 'cerapan1' | 'cerapan2',
  ) {
    const cerapan = await this.cerapanModel.findOne({
      teacherId,
      subject,
      class: className,
    });
    if (!cerapan) return type === 'kendiri';
    if (type === 'cerapan1')
      // return cerapan.self_evaluation.status === 'submitted';
      return (
        cerapan.observation_1.status !== 'submitted' &&
        cerapan.observation_2.status !== 'submitted'
      );
    if (type === 'cerapan2')
      return (
        cerapan.observation_1.status === 'submitted' &&
        cerapan.observation_2.status !== 'submitted'
      );
    return false;
  }

  // Check if cerapan 1 or 2 can start (schedule must be set)
  async canStartCerapan(
    teacherId: string,
    subject: string,
    className: string,
    type: 'cerapan1' | 'cerapan2',
  ) {
    const cerapan = await this.cerapanModel.findOne({
      teacherId,
      subject,
      class: className,
    });
    if (!cerapan) return false;

    if (type === 'cerapan1')
      return (
        !!cerapan.scheduledDate && cerapan.observation_1.status !== 'submitted'
      );
    if (type === 'cerapan2')
      return (
        !!cerapan.scheduledDate && cerapan.observation_1.status === 'submitted'
      );
    return false;
  }

  // Notify teacher on dashboard (pseudo, to be implemented in frontend)
  async getScheduleNotification(teacherId: string) {
    const cerapan = await this.cerapanModel.find({
      teacherId,
      scheduledDate: { $ne: null },
    });
    return cerapan.map((c) => ({
      subject: c.subject,
      class: c.class,
      date: c.scheduledDate,
      type: c.observationType,
    }));
  }
}
