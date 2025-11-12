import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cerapan } from './cerapan.schema';
import { SubmitCerapankendiriDto } from './dto/submit-cerapankendiri.dto';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { QuestionService } from '../question/question.service';
import { SubmitObservationDto } from './dto/submit-cerapan.dto'; // <-- 1. ADD THIS IMPORT

@Injectable()
export class CerapanService {
  constructor(
    @InjectModel(Cerapan.name) private cerapanModel: Model<Cerapan>,
    private readonly questionService: QuestionService,
  ) {}

  // ===============================================
  // === ADMIN FUNCTION (CREATE) ===
  // ===============================================

  async createEvaluation(dto: CreateEvaluationDto): Promise<Cerapan> {
    const template = await this.questionService.findOne(dto.templateId);
    if (!template) {
      throw new NotFoundException('Question template (rubric) not found');
    }

    const questions_snapshot = template.questions.map((q) => {
      return {
        questionId: q.id,
        text: q.text,
        category: q.category,
        maxScore: q.maxScore,
      };
    });

    const newEvaluation = new this.cerapanModel({
      teacherId: dto.teacherId,
      period: dto.period,
      subject: dto.subject,
      class: dto.class,
      templateId: dto.templateId,
      questions_snapshot: questions_snapshot,
      status: 'pending_self_evaluation',
      self_evaluation: { status: 'pending', answers: [] },
      observation_1: { status: 'pending', marks: [] },
      observation_2: { status: 'pending', marks: [] },
    });

    return newEvaluation.save();
  }

  // ===============================================
  // === TEACHER FUNCTIONS (GURU) ===
  // ===============================================

  async getMyPendingTasks(teacherId: string): Promise<Cerapan[]> {
    return this.cerapanModel
      .find({
        teacherId: teacherId,
        'self_evaluation.status': 'pending',
      })
      .select('period templateId status')
      .exec();
  }

  async getEvaluationForTask(
    evaluationId: string,
    teacherId: string,
  ): Promise<Cerapan> {
    const task = await this.cerapanModel
      .findOne({
        _id: evaluationId,
        teacherId: teacherId,
      })
      .exec();
    if (!task) {
      throw new NotFoundException('Evaluation task not found');
    }
    return task;
  }

  async submitSelfEvaluation(
    evaluationId: string,
    dto: SubmitCerapankendiriDto,
    teacherId: string,
  ): Promise<Cerapan> {
    const evaluation = await this.cerapanModel.findOne({
      _id: evaluationId,
      teacherId: teacherId,
    });
    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }
    if (evaluation.self_evaluation.status !== 'pending') {
      throw new BadRequestException('Self-evaluation has already been submitted');
    }

    evaluation.self_evaluation.answers = dto.answers;
    evaluation.self_evaluation.status = 'submitted';
    evaluation.self_evaluation.submittedAt = new Date();
    evaluation.status = 'pending_observation_1';

    return evaluation.save();
  }

  async getMyReportHistory(teacherId: string): Promise<Cerapan[]> {
    return this.cerapanModel
      .find({
        teacherId: teacherId,
        status: { $ne: 'pending_self_evaluation' },
      })
      .select('period templateId status')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getCompletedReport(
    evaluationId: string,
    teacherId: string,
  ): Promise<Cerapan> {
    const report = await this.cerapanModel
      .findOne({
        _id: evaluationId,
        teacherId: teacherId,
      })
      .exec();
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  // ===============================================
  // === NEW ADMIN FUNCTIONS (PENTADBIR) ===
  // ===============================================

  /**
   * 1. Get the "To-Do" list for all administrators.
   */
  async getAdminPendingTasks(): Promise<Cerapan[]> {
    return this.cerapanModel
      .find({
        status: { $in: ['pending_observation_1', 'pending_observation_2'] },
      })
      .select('period teacherId status')
      .sort({ status: 1 })
      .exec();
  }

  /**
   * 2. Submit marks for Observation 1.
   */
  async submitObservation1(
    evaluationId: string,
    dto: SubmitObservationDto,
    adminId: string,
  ): Promise<Cerapan> {
    const evaluation = await this.cerapanModel.findById(evaluationId);
    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }
    if (evaluation.status !== 'pending_observation_1') {
      throw new BadRequestException(
        'This evaluation is not ready for Observation 1.',
      );
    }

    evaluation.observation_1.marks = dto.marks;
    evaluation.observation_1.status = 'submitted';
    evaluation.observation_1.submittedAt = new Date();
    evaluation.observation_1.administratorId = adminId;
    evaluation.status = 'pending_observation_2';

    return evaluation.save();
  }

  /**
   * 3. Submit marks for Observation 2.
   */
  async submitObservation2(
    evaluationId: string,
    dto: SubmitObservationDto,
    adminId: string,
  ): Promise<Cerapan> {
    const evaluation = await this.cerapanModel.findById(evaluationId);
    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }
    if (evaluation.status !== 'pending_observation_2') {
      throw new BadRequestException(
        'This evaluation is not ready for Observation 2.',
      );
    }

    evaluation.observation_2.marks = dto.marks;
    evaluation.observation_2.status = 'submitted';
    evaluation.observation_2.submittedAt = new Date();
    evaluation.observation_2.administratorId = adminId;
    evaluation.status = 'marked'; // This is the FINAL status

    return evaluation.save();
  }
}