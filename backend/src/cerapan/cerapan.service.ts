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
import { PentadbirService } from '../pentadbir/pentadbir.service';
import { SubmitObservationDto } from './dto/submit-cerapan.dto';

@Injectable()
export class CerapanService {
  constructor(
    @InjectModel(Cerapan.name) private cerapanModel: Model<Cerapan>,
    private readonly pentadbirService: PentadbirService,
  ) {}



  async createEvaluation(dto: CreateEvaluationDto): Promise<Cerapan> {
    const template = await this.pentadbirService.getTemplateById(dto.templateId);
    if (!template) {
      throw new NotFoundException('Template rubric not found');
    }

    // Flatten all items from all categories and subcategories with score descriptions
    const questions_snapshot: any[] = [];
    for (const category of template.categories) {
      for (const subCategory of category.subCategories) {
        for (const item of subCategory.items) {
          questions_snapshot.push({
            questionId: item.id,
            text: item.text,
            maxScore: item.maxScore,
            scoreDescriptions: item.scoreDescriptions || [],
            categoryCode: category.code,
            subCategoryCode: subCategory.code,
          });
        }
      }
    }

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
      .select('period templateId status subject class')
      .exec();
  }

  /**
   * (ADMIN) Get evaluation by id for observation (no teacher restriction).
   */
  async getEvaluationByIdAdmin(evaluationId: string): Promise<Cerapan> {
    const evaluation = await this.cerapanModel
      .findById(evaluationId)
      .select(
        'teacherId period subject class templateId questions_snapshot status self_evaluation observation_1 observation_2',
      )
      .exec();
    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }
    return evaluation;
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

  // === SUMMARY / CALCULATION HELPERS ===
 

  private clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }


  private computeSummary(evaluation: Cerapan) {
    const totalItems = evaluation.questions_snapshot.length;
    const maxPerItem = (qid: string) => {
      const q = evaluation.questions_snapshot.find(q => q.questionId === qid);
      return q?.maxScore ?? 0;
    };

    const maxTotal = evaluation.questions_snapshot.reduce((sum, q) => sum + (q.maxScore || 0), 0);

    // Self evaluation completion (answers are strings)
    const selfAnswered = evaluation.self_evaluation?.answers?.length || 0;
    const selfCompletionPct = totalItems > 0 ? +(100 * selfAnswered / totalItems).toFixed(2) : 0;

    // Aggregate function for observation sections (numeric marks)
    const aggregateObservation = (section: any) => {
      const marks: { questionId: string; mark: number }[] = section?.marks || [];
      if (!marks.length) {
        return { total: 0, maxTotal, percent: 0, avgPerItem: 0, count: 0 };
      }
      let total = 0;
      let count = 0;
      for (const m of marks) {
        const max = maxPerItem(m.questionId);
        const use = this.clamp(Number(m.mark || 0), 0, max || 0);
        total += use;
        count += 1;
      }
      const percent = maxTotal > 0 ? +(100 * total / maxTotal).toFixed(2) : 0;
      const avgPerItem = count > 0 ? +(total / count).toFixed(2) : 0;
      return { total: +total.toFixed(2), maxTotal, percent, avgPerItem, count };
    };

    const obs1 = aggregateObservation(evaluation.observation_1);
    const obs2 = aggregateObservation(evaluation.observation_2);

    type CatAgg = { code: string; fullMark: number; achievedSelf: number; score10_Self: number; percentSelf: number; achieved1: number; score10_1: number; percent1: number; achieved2: number; score10_2: number; percent2: number };
    const groupBySubCat: Record<string, { fullMark: number; qIds: string[] }> = {};
    for (const q of evaluation.questions_snapshot) {
      const code = q.subCategoryCode || 'UNKNOWN';
      if (!groupBySubCat[code]) groupBySubCat[code] = { fullMark: 0, qIds: [] };
      groupBySubCat[code].fullMark += q.maxScore || 0;
      groupBySubCat[code].qIds.push(q.questionId);
    }

    const sumMarksFor = (marks: { questionId: string; mark: number }[], qIds: string[]) => {
      const set = new Set(qIds);
      let total = 0;
      for (const m of marks || []) {
        if (set.has(m.questionId)) {
          total += this.clamp(Number(m.mark || 0), 0, maxPerItem(m.questionId));
        }
      }
      return total;
    };

    const sumSelfFor = (answers: { questionId: string; answer: string }[], qIds: string[]) => {
      const set = new Set(qIds);
      let total = 0;
      for (const a of answers || []) {
        if (set.has(a.questionId)) {
          const max = maxPerItem(a.questionId);
          const num = Number(a.answer);
          if (!Number.isNaN(num)) {
            total += this.clamp(num, 0, max || 0);
          }
        }
      }
      return total;
    };

    const catBreakdown: CatAgg[] = Object.entries(groupBySubCat).map(([code, info]) => {
      const full = info.fullMark || 0;
      const aSelf = sumSelfFor(evaluation.self_evaluation?.answers || [], info.qIds);
      const a1 = sumMarksFor(evaluation.observation_1?.marks || [], info.qIds);
      const a2 = sumMarksFor(evaluation.observation_2?.marks || [], info.qIds);
      const sSelf = full > 0 ? +(((aSelf / full) * 10)).toFixed(2) : 0; // 0..10 scale
      const s1 = full > 0 ? +(((a1 / full) * 10)).toFixed(2) : 0; // 0..10 scale
      const s2 = full > 0 ? +(((a2 / full) * 10)).toFixed(2) : 0;
      const pSelf = full > 0 ? +(((aSelf / full) * 100)).toFixed(2) : 0;
      const p1 = full > 0 ? +(((a1 / full) * 100)).toFixed(2) : 0;
      const p2 = full > 0 ? +(((a2 / full) * 100)).toFixed(2) : 0;
      return {
        code,
        fullMark: +full.toFixed(2),
        achievedSelf: +aSelf.toFixed(2),
        score10_Self: sSelf,
        percentSelf: pSelf,
        achieved1: +a1.toFixed(2),
        score10_1: s1,
        percent1: p1,
        achieved2: +a2.toFixed(2),
        score10_2: s2,
        percent2: p2,
      };
    }).sort((a, b) => a.code.localeCompare(b.code));

    const totalScore10_Self = +catBreakdown.reduce((s, x) => s + x.score10_Self, 0).toFixed(2);
    const totalScore10_1 = +catBreakdown.reduce((s, x) => s + x.score10_1, 0).toFixed(2);
    const totalScore10_2 = +catBreakdown.reduce((s, x) => s + x.score10_2, 0).toFixed(2);
    const totalRawAchievedSelf = +catBreakdown.reduce((s, x) => s + x.achievedSelf, 0).toFixed(2);
    const totalRawAchieved1 = +catBreakdown.reduce((s, x) => s + x.achieved1, 0).toFixed(2);
    const totalRawAchieved2 = +catBreakdown.reduce((s, x) => s + x.achieved2, 0).toFixed(2);
    const totalFullMarks = +catBreakdown.reduce((s, x) => s + x.fullMark, 0).toFixed(2);

    // Overall percent: mean of available observation percents (ignore empty)
    const observedPercents = [obs1, obs2].filter(x => x.count > 0).map(x => x.percent);
    const overallPercent = observedPercents.length
      ? +(observedPercents.reduce((a, b) => a + b, 0) / observedPercents.length).toFixed(2)
      : 0;

    const scale = (() => {
      // Try to infer scale from first question
      const s = evaluation.questions_snapshot[0]?.maxScore;
      return typeof s === 'number' && s > 0 ? s : 4;
    })();

    const overallAvgScore = scale > 0 ? +((overallPercent / 100) * scale).toFixed(2) : 0;

    // Label mapping based on average score on 0..scale
    const label = (() => {
      if (overallAvgScore >= scale * 0.875) return 'Cemerlang';
      if (overallAvgScore >= scale * 0.625) return 'Baik';
      if (overallAvgScore >= scale * 0.375) return 'Sederhana';
      if (overallAvgScore > 0) return 'Lemah';
      return 'Tidak Dinilai';
    })();

    return {
      meta: {
        items: totalItems,
        maxTotal,
        scale,
      },
      selfEvaluation: {
        answered: selfAnswered,
        completionPercent: selfCompletionPct,
        status: evaluation.self_evaluation?.status || 'pending',
        submittedAt: evaluation.self_evaluation?.submittedAt || null,
      },
      observation1: {
        ...obs1,
        status: evaluation.observation_1?.status || 'pending',
        submittedAt: evaluation.observation_1?.submittedAt || null,
      },
      observation2: {
        ...obs2,
        status: evaluation.observation_2?.status || 'pending',
        submittedAt: evaluation.observation_2?.submittedAt || null,
      },
      categories: {
        breakdown: catBreakdown,
        totals: {
          // Sum of per-subcategory 0..10 scores; matches examples like 82.05
          selfScore10Sum: totalScore10_Self,
          observation1Score10Sum: totalScore10_1,
          observation2Score10Sum: totalScore10_2,
          selfRawAchieved: totalRawAchievedSelf,
          observation1RawAchieved: totalRawAchieved1,
          observation2RawAchieved: totalRawAchieved2,
          fullMarkSum: totalFullMarks,
          // Overall percentages by raw marks
          selfPercent: totalFullMarks > 0 ? +((totalRawAchievedSelf / totalFullMarks) * 100).toFixed(2) : 0,
          observation1Percent: totalFullMarks > 0 ? +((totalRawAchieved1 / totalFullMarks) * 100).toFixed(2) : 0,
          observation2Percent: totalFullMarks > 0 ? +((totalRawAchieved2 / totalFullMarks) * 100).toFixed(2) : 0,
        },
      },
      overall: {
        percent: overallPercent,
        avgScore: overallAvgScore,
        label,
      },
    };
  }

  /**
   * Return report plus computed summary for teacher.
   */
  async getReportWithSummary(evaluationId: string, teacherId: string) {
    const report = await this.getCompletedReport(evaluationId, teacherId);
    const summary = this.computeSummary(report);
    return { report, summary };
  }

  /**
   * (ADMIN) Return report plus computed summary for any evaluation (no teacher restriction).
   */
  async getAdminReportWithSummary(evaluationId: string) {
    const report = await this.cerapanModel.findById(evaluationId).exec();
    if (!report) {
      throw new NotFoundException('Evaluation not found');
    }
    const summary = this.computeSummary(report);
    return { report, summary };
  }

  // (Demo helpers removed)

  /**
   * Teacher initiates their own self-evaluation (same logic as admin createEvaluation but teacherId derived from JWT).
   */
  async createTeacherSelfEvaluation(
    teacherId: string,
    dto: { templateId: string; period: string; subject: string; class: string },
  ): Promise<Cerapan> {
    const template = await this.pentadbirService.getTemplateById(dto.templateId);
    if (!template) {
      throw new NotFoundException('Template rubric not found');
    }

    const questions_snapshot: any[] = [];
    for (const category of template.categories) {
      for (const subCategory of category.subCategories) {
        for (const item of subCategory.items) {
          questions_snapshot.push({
            questionId: item.id,
            text: item.text,
            maxScore: item.maxScore,
            scoreDescriptions: item.scoreDescriptions || [],
            categoryCode: category.code,
            subCategoryCode: subCategory.code,
          });
        }
      }
    }

    const newEvaluation = new this.cerapanModel({
      teacherId: teacherId,
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
    // Allow admin to proceed even if teacher hasn't submitted self-eval yet
    if (evaluation.status !== 'pending_observation_1' && evaluation.status !== 'pending_self_evaluation') {
      throw new BadRequestException(
        `This evaluation is not ready for Observation 1. Current status: ${evaluation.status}. Expected: pending_observation_1 or pending_self_evaluation.`,
      );
    }
    if (!Array.isArray(evaluation.questions_snapshot) || evaluation.questions_snapshot.length === 0) {
      throw new BadRequestException('Evaluation has no question snapshot to score');
    }
    if (!evaluation.observation_1) {
      (evaluation as any).observation_1 = {
        status: 'pending',
        submittedAt: null,
        answers: [],
        marks: [],
        administratorId: null,
      };
    }
    // Normalize & validate marks against snapshot
    const snapshotIds = new Set(evaluation.questions_snapshot.map(q => q.questionId));
    const normalized = [] as { questionId: string; mark: number; comment?: string }[];
    for (const m of dto.marks || []) {
      if (!m || typeof m.questionId !== 'string') continue;
      if (!snapshotIds.has(m.questionId)) continue; // ignore unknown questionIds
      const q = evaluation.questions_snapshot.find(q => q.questionId === m.questionId);
      const max = q?.maxScore ?? 0;
      let markNum = Number(m.mark);
      if (Number.isNaN(markNum)) markNum = 0;
      if (markNum < 0) markNum = 0;
      if (markNum > max) markNum = max;
      const entry: { questionId: string; mark: number; comment?: string } = { questionId: m.questionId, mark: markNum };
      if (typeof m.comment === 'string' && m.comment.trim().length > 0) {
        entry.comment = m.comment.trim();
      }
      normalized.push(entry);
    }
    if (!normalized.length) {
      throw new BadRequestException('No valid marks provided for Observation 1');
    }
    evaluation.observation_1.marks = normalized;
    evaluation.observation_1.status = 'submitted';
    evaluation.observation_1.submittedAt = new Date();
    evaluation.observation_1.administratorId = adminId;
    evaluation.status = 'pending_observation_2';
    try {
      return await evaluation.save();
    } catch (err: any) {
      // Log detailed error for debugging
      // eslint-disable-next-line no-console
      console.error('Error saving Observation 1 marks:', err?.message, err?.errors || err);
      const detail = typeof err?.message === 'string' ? err.message : 'Unknown error';
      throw new BadRequestException({ message: 'Failed to save Observation 1 marks', detail });
    }
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
        `This evaluation is not ready for Observation 2. Current status: ${evaluation.status}. Expected: pending_observation_2 (Observation 1 must be completed first).`,
      );
    }
    if (!Array.isArray(evaluation.questions_snapshot) || evaluation.questions_snapshot.length === 0) {
      throw new BadRequestException('Evaluation has no question snapshot to score');
    }
    if (!evaluation.observation_2) {
      (evaluation as any).observation_2 = {
        status: 'pending',
        submittedAt: null,
        answers: [],
        marks: [],
        administratorId: null,
      };
    }
    const snapshotIds = new Set(evaluation.questions_snapshot.map(q => q.questionId));
    const normalized = [] as { questionId: string; mark: number; comment?: string }[];
    for (const m of dto.marks || []) {
      if (!m || typeof m.questionId !== 'string') continue;
      if (!snapshotIds.has(m.questionId)) continue;
      const q = evaluation.questions_snapshot.find(q => q.questionId === m.questionId);
      const max = q?.maxScore ?? 0;
      let markNum = Number(m.mark);
      if (Number.isNaN(markNum)) markNum = 0;
      if (markNum < 0) markNum = 0;
      if (markNum > max) markNum = max;
      const entry: { questionId: string; mark: number; comment?: string } = { questionId: m.questionId, mark: markNum };
      if (typeof m.comment === 'string' && m.comment.trim().length > 0) {
        entry.comment = m.comment.trim();
      }
      normalized.push(entry);
    }
    if (!normalized.length) {
      throw new BadRequestException('No valid marks provided for Observation 2');
    }
    evaluation.observation_2.marks = normalized;
    evaluation.observation_2.status = 'submitted';
    evaluation.observation_2.submittedAt = new Date();
    evaluation.observation_2.administratorId = adminId;
    evaluation.status = 'marked';
    try {
      return await evaluation.save();
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Error saving Observation 2 marks:', err?.message, err?.errors || err);
      const detail = typeof err?.message === 'string' ? err.message : 'Unknown error';
      throw new BadRequestException({ message: 'Failed to save Observation 2 marks', detail });
    }
  }
}