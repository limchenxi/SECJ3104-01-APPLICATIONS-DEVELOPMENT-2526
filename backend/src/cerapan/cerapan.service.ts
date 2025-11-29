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

// -------------------------------------------------------------
// WEIGHT MAP FOR SUBCATEGORY CODES (TOTAL 100)
// Each entry: subCategoryCode => weight (points contribution when full mark achieved)
// Formula per subcategory: (achieved / fullMark) * weight
// Provided weights:
// 4.1.1: 10, 4.2.1: 10, 4.2.2: 5, 4.3.1: 15, 4.4.1: 25, 4.4.2: 5, 4.5.1: 10, 4.6.1: 20 (sum = 100)
const SUBCATEGORY_WEIGHT_MAP: Record<string, number> = {
  '4.1.1': 10,
  '4.2.1': 10,
  '4.2.2': 5,
  '4.3.1': 15,
  '4.4.1': 25,
  '4.4.2': 5,
  '4.5.1': 10,
  '4.6.1': 20,
};

@Injectable()
export class CerapanService {
    /**
     * Admin: Start Cerapan 1 for an evaluation (set status and prepare observation_1)
     */
    async startObservation1ByAdmin(evaluationId: string): Promise<Cerapan> {
      const evaluation = await this.cerapanModel.findById(evaluationId);
      if (!evaluation) {
        throw new NotFoundException('Evaluation not found');
      }
      // Only allow if status is pending_self_evaluation or pending_observation_1
      if (evaluation.status !== 'pending_self_evaluation' && evaluation.status !== 'pending_observation_1') {
        throw new BadRequestException(`Evaluation is not ready for Cerapan 1. Current status: ${evaluation.status}`);
      }
      // Set status to pending_observation_1 and prepare observation_1
      evaluation.status = 'pending_observation_1';
      if (!evaluation.observation_1) {
        evaluation.observation_1 = {
          status: 'pending',
          marks: [],
          submittedAt: new Date(0),
          answers: [],
          administratorId: undefined,
        };
      } else {
        evaluation.observation_1.status = 'pending';
        evaluation.observation_1.submittedAt = new Date(0);
        evaluation.observation_1.answers = [];
        evaluation.observation_1.administratorId = undefined;
      }
      await evaluation.save();
      return evaluation;
    }
  constructor(
    @InjectModel(Cerapan.name) private cerapanModel: Model<Cerapan>,
    private readonly pentadbirService: PentadbirService,
  ) {}



  async createEvaluation(dto: CreateEvaluationDto): Promise<Cerapan> {
    // Check if cerapan already exists for this teacher, subject, class, and period
    const existing = await this.cerapanModel.findOne({
      teacherId: dto.teacherId,
      period: dto.period,
      subject: dto.subject,
      class: dto.class,
    });

    if (existing) {
      throw new BadRequestException(
        `Cerapan untuk ${dto.subject} - ${dto.class} dalam tempoh ${dto.period} sudah wujud.`,
      );
    }

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
3    }

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

  async updateSchedule(
    evaluationId: string,
    scheduleData: {
      scheduledDate: string;
      scheduledTime: string;
      observerName: string;
      templateRubric: string;
      notes?: string;
      observationType: string;
    },
  ): Promise<Cerapan> {
    const evaluation = await this.cerapanModel.findById(evaluationId);
    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }

    evaluation.scheduledDate = scheduleData.scheduledDate;
    evaluation.scheduledTime = scheduleData.scheduledTime;
    evaluation.observerName = scheduleData.observerName;
    evaluation.templateRubric = scheduleData.templateRubric;
    evaluation.notes = scheduleData.notes || '';
    evaluation.observationType = scheduleData.observationType;

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

    type CatAgg = { code: string; fullMark: number; achievedSelf: number; weightedSelf: number; percentSelf: number; achieved1: number; weighted1: number; percent1: number; achieved2: number; weighted2: number; percent2: number; weight: number };
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
      const pSelf = full > 0 ? +(((aSelf / full) * 100)).toFixed(2) : 0;
      const p1 = full > 0 ? +(((a1 / full) * 100)).toFixed(2) : 0;
      const p2 = full > 0 ? +(((a2 / full) * 100)).toFixed(2) : 0;
      const weight = SUBCATEGORY_WEIGHT_MAP[code] ?? 0;
      const weightedSelf = full > 0 ? +(((aSelf / full) * weight)).toFixed(2) : 0;
      const weighted1 = full > 0 ? +(((a1 / full) * weight)).toFixed(2) : 0;
      const weighted2 = full > 0 ? +(((a2 / full) * weight)).toFixed(2) : 0;
      return {
        code,
        fullMark: +full.toFixed(2),
        achievedSelf: +aSelf.toFixed(2),
        weightedSelf,
        percentSelf: pSelf,
        achieved1: +a1.toFixed(2),
        weighted1,
        percent1: p1,
        achieved2: +a2.toFixed(2),
        weighted2,
        percent2: p2,
        weight,
      };
    }).sort((a, b) => a.code.localeCompare(b.code));

    const totalRawAchievedSelf = +catBreakdown.reduce((s, x) => s + x.achievedSelf, 0).toFixed(2);
    const totalRawAchieved1 = +catBreakdown.reduce((s, x) => s + x.achieved1, 0).toFixed(2);
    const totalRawAchieved2 = +catBreakdown.reduce((s, x) => s + x.achieved2, 0).toFixed(2);
    const totalFullMarks = +catBreakdown.reduce((s, x) => s + x.fullMark, 0).toFixed(2);

    // Weighted totals (out of 100) per section
    const totalWeightedSelf = +catBreakdown.reduce((s, x) => s + x.weightedSelf, 0).toFixed(2);
    const totalWeighted1 = +catBreakdown.reduce((s, x) => s + x.weighted1, 0).toFixed(2);
    const totalWeighted2 = +catBreakdown.reduce((s, x) => s + x.weighted2, 0).toFixed(2);

    // Overall percent: mean of available observation percents (ignore empty)
    const observedPercents = [obs1, obs2].filter(x => x.count > 0).map(x => x.percent);
    const overallPercent = observedPercents.length
      ? +(observedPercents.reduce((a, b) => a + b, 0) / observedPercents.length).toFixed(2)
      : 0;

    // New overall weighted observation percent (summing weighted contributions of obs1 & obs2)
    const overallWeightedObservation = +(totalWeighted1 + totalWeighted2).toFixed(2);
    // Individual 0..100 scales for each section (already weighted by subcategory weights)
    const weightedSelf = totalWeightedSelf; // 0..100
    const weightedObs1 = totalWeighted1;    // 0..100
    const weightedObs2 = totalWeighted2;    // 0..100
    // Average across the three sections (excluding those with 0 if desired)
    const presentWeighted = [weightedSelf, weightedObs1, weightedObs2].filter(v => v > 0);
    const triAverageWeighted = presentWeighted.length ? +(presentWeighted.reduce((a,b)=>a+b,0) / presentWeighted.length).toFixed(2) : 0;

    const scale = (() => {
      // Try to infer scale from first question
      const s = evaluation.questions_snapshot[0]?.maxScore;
      return typeof s === 'number' && s > 0 ? s : 4;
    })();

    const overallAvgScore = scale > 0 ? +((overallPercent / 100) * scale).toFixed(2) : 0;
    // Label based on weighted observation total (fallback to previous if zero)
    // Performance basis now uses tri-section average if available, else combined observations, else raw percent
    const performanceBasis = triAverageWeighted > 0 ? triAverageWeighted : (overallWeightedObservation > 0 ? overallWeightedObservation : overallPercent);

    // Label mapping based on average score on 0..scale
    const label = (() => {
      // If weighted observation basis used, treat 0..100 similar thresholds (customizable)
      if (performanceBasis >= 85) return 'Cemerlang';
      if (performanceBasis >= 65) return 'Baik';
      if (performanceBasis >= 40) return 'Sederhana';
      if (performanceBasis > 0) return 'Lemah';
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
          selfRawAchieved: totalRawAchievedSelf,
          observation1RawAchieved: totalRawAchieved1,
          observation2RawAchieved: totalRawAchieved2,
          fullMarkSum: totalFullMarks,
          selfPercent: totalFullMarks > 0 ? +((totalRawAchievedSelf / totalFullMarks) * 100).toFixed(2) : 0,
          observation1Percent: totalFullMarks > 0 ? +((totalRawAchieved1 / totalFullMarks) * 100).toFixed(2) : 0,
          observation2Percent: totalFullMarks > 0 ? +((totalRawAchieved2 / totalFullMarks) * 100).toFixed(2) : 0,
          // New weighted totals (out of 100 if all weights sum to 100)
          weightedSelfTotal: totalWeightedSelf,
          weightedObservation1Total: totalWeighted1,
          weightedObservation2Total: totalWeighted2,
          weightedObservationCombined: overallWeightedObservation,
        },
      },
      overall: {
        percent: overallPercent,
        avgScore: overallAvgScore,
        label,
        weightedObservation: overallWeightedObservation,
        weightedSelf,
        weightedObservation1: weightedObs1,
        weightedObservation2: weightedObs2,
        triAverageWeighted,
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
      .select('period teacherId status subject class self_evaluation observation_1 observation_2 createdAt')
      .sort({ status: 1, createdAt: -1 })
      .exec();
  }

  /**
   * Get all evaluations for admin overview (including completed).
   */
  async getAllEvaluationsForAdmin(): Promise<Cerapan[]> {
    return this.cerapanModel
      .find({})
      .select('period teacherId status subject class self_evaluation observation_1 observation_2 createdAt scheduledDate scheduledTime observerName templateRubric notes observationType')
      .sort({ createdAt: -1 })
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
    
    // Reset schedule fields for Cerapan 2
    evaluation.scheduledDate = undefined;
    evaluation.scheduledTime = undefined;
    evaluation.observerName = undefined;
    evaluation.templateRubric = undefined;
    evaluation.notes = undefined;
    evaluation.observationType = undefined;
    
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