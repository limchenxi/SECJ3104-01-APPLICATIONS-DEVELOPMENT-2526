import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Cerapan,
  ObservationSection,
  QuestionSnapshot,
} from './cerapan.schema';
import { SubmitCerapankendiriDto } from './dto/submit-cerapankendiri.dto';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { PentadbirService } from '../pentadbir/pentadbir.service';
import { SubmitObservationDto } from './dto/submit-cerapan.dto';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { AI_USAGE_MODEL_NAME, AiUsage } from 'src/ai/schemas/ai-usage.schema';

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
  private aiModel: GenerativeModel | null = null;
  constructor(
    @InjectModel(Cerapan.name) private cerapanModel: Model<Cerapan>,
    private readonly pentadbirService: PentadbirService,
    // 【新增注入】 - 用于记录 AI 使用量
    @InjectModel(AI_USAGE_MODEL_NAME) private usageModel: Model<AiUsage>,
  ) {
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      console.error('❌ GEMINI_API_KEY missing in environment variables');
      // 生产环境应该抛出错误，但这里遵循 RphService 模式，允许服务启动，并在调用时处理失败
    } else {
      const genAI = new GoogleGenerativeAI(key);

      this.aiModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });
    }
  }
  private getTarafLabel(score: number): string {
    if (score >= 85) return 'CEMERLANG';
    if (score >= 70) return 'BAIK';
    if (score >= 55) return 'SEDERHANA';
    if (score >= 0) return 'PERLU TINDAKAN SEGERA';
    return 'Tidak Dinilai';
  }
  /**
   * Admin: Start Cerapan 1 for an evaluation (set status and prepare observation_1)
   */
  async startObservation1ByAdmin(evaluationId: string): Promise<Cerapan> {
    const evaluation = await this.cerapanModel.findById(evaluationId);
    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }
    if (
      evaluation.observation_1.status === 'submitted' ||
      evaluation.observation_2.status === 'submitted'
    ) {
      throw new BadRequestException(
        `Evaluation is not ready for Cerapan 1. Cerapan 1 or 2 already submitted.`,
      );
    }
    // Only allow if status is pending_self_evaluation or pending_observation_1
    if (
      evaluation.observation_1.status === 'submitted' ||
      evaluation.observation_2.status === 'submitted'
    )
      //   throw new BadRequestException(
      //     `Evaluation is not ready for Cerapan 1. Current status: ${evaluation.status}`,
      //   );
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

    const template = await this.pentadbirService.getTemplateById(
      dto.templateId,
    );
    if (!template) {
      throw new NotFoundException('Template rubric not found');
    }

    // Flatten all items from all categories and subcategories with score descriptions
    const questions_snapshot: QuestionSnapshot[] = [];
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
      throw new BadRequestException(
        'Self-evaluation has already been submitted',
      );
    }

    evaluation.self_evaluation.answers = dto.answers;
    evaluation.self_evaluation.status = 'submitted';
    evaluation.self_evaluation.submittedAt = new Date();
    if (evaluation.observation_2.status === 'submitted') {
      evaluation.status = 'marked'; // Obs 2 已完成，流程结束
    } else if (evaluation.observation_1.status === 'submitted') {
      evaluation.status = 'pending_observation_2'; // Obs 1 已完成，等待 Obs 2
    }

    const savedEvaluation = await evaluation.save();
    await this.checkAndGenerateAiComment(savedEvaluation);
    return savedEvaluation;
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
      const q = evaluation.questions_snapshot.find((q) => q.questionId === qid);
      return q?.maxScore ?? 0;
    };

    const maxTotal = evaluation.questions_snapshot.reduce(
      (sum, q) => sum + (q.maxScore || 0),
      0,
    );

    // Self evaluation completion (answers are strings)
    const selfAnswered = evaluation.self_evaluation?.answers?.length || 0;
    const selfCompletionPct =
      totalItems > 0 ? +((100 * selfAnswered) / totalItems).toFixed(2) : 0;

    // Aggregate function for observation sections (numeric marks)
    const aggregateObservation = (section: ObservationSection) => {
      const marks: { questionId: string; mark: number }[] =
        section?.marks || [];
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
      const percent = maxTotal > 0 ? +((100 * total) / maxTotal).toFixed(2) : 0;
      const avgPerItem = count > 0 ? +(total / count).toFixed(2) : 0;
      return { total: +total.toFixed(2), maxTotal, percent, avgPerItem, count };
    };

    const obs1 = aggregateObservation(evaluation.observation_1);
    const obs2 = aggregateObservation(evaluation.observation_2);

    type CatAgg = {
      code: string;
      fullMark: number;
      achievedSelf: number;
      weightedSelf: number;
      percentSelf: number;
      achieved1: number;
      weighted1: number;
      percent1: number;
      achieved2: number;
      weighted2: number;
      percent2: number;
      weight: number;
    };
    const groupBySubCat: Record<string, { fullMark: number; qIds: string[] }> =
      {};
    for (const q of evaluation.questions_snapshot) {
      const code = q.subCategoryCode || 'UNKNOWN';
      if (!groupBySubCat[code]) groupBySubCat[code] = { fullMark: 0, qIds: [] };
      groupBySubCat[code].fullMark += q.maxScore || 0;
      groupBySubCat[code].qIds.push(q.questionId);
    }

    const sumMarksFor = (
      marks: { questionId: string; mark: number }[],
      qIds: string[],
    ) => {
      const set = new Set(qIds);
      let total = 0;
      for (const m of marks || []) {
        if (set.has(m.questionId)) {
          total += this.clamp(Number(m.mark || 0), 0, maxPerItem(m.questionId));
        }
      }
      return total;
    };

    const sumSelfFor = (
      answers: { questionId: string; answer: string }[],
      qIds: string[],
    ) => {
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

    const catBreakdown: CatAgg[] = Object.entries(groupBySubCat)
      .map(([code, info]) => {
        const full = info.fullMark || 0;
        const aSelf = sumSelfFor(
          evaluation.self_evaluation?.answers || [],
          info.qIds,
        );
        const a1 = sumMarksFor(
          evaluation.observation_1?.marks || [],
          info.qIds,
        );
        const a2 = sumMarksFor(
          evaluation.observation_2?.marks || [],
          info.qIds,
        );
        const pSelf = full > 0 ? +((aSelf / full) * 100).toFixed(2) : 0;
        const p1 = full > 0 ? +((a1 / full) * 100).toFixed(2) : 0;
        const p2 = full > 0 ? +((a2 / full) * 100).toFixed(2) : 0;
        const weight = SUBCATEGORY_WEIGHT_MAP[code] ?? 0;
        const weightedSelf =
          full > 0 ? +((aSelf / full) * weight).toFixed(2) : 0;
        const weighted1 = full > 0 ? +((a1 / full) * weight).toFixed(2) : 0;
        const weighted2 = full > 0 ? +((a2 / full) * weight).toFixed(2) : 0;
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
      })
      .sort((a, b) => a.code.localeCompare(b.code));

    const totalRawAchievedSelf = +catBreakdown
      .reduce((s, x) => s + x.achievedSelf, 0)
      .toFixed(2);
    const totalRawAchieved1 = +catBreakdown
      .reduce((s, x) => s + x.achieved1, 0)
      .toFixed(2);
    const totalRawAchieved2 = +catBreakdown
      .reduce((s, x) => s + x.achieved2, 0)
      .toFixed(2);
    const totalFullMarks = +catBreakdown
      .reduce((s, x) => s + x.fullMark, 0)
      .toFixed(2);

    // Weighted totals (out of 100) per section
    const totalWeightedSelf = +catBreakdown
      .reduce((s, x) => s + x.weightedSelf, 0)
      .toFixed(2);
    const totalWeighted1 = +catBreakdown
      .reduce((s, x) => s + x.weighted1, 0)
      .toFixed(2);
    const totalWeighted2 = +catBreakdown
      .reduce((s, x) => s + x.weighted2, 0)
      .toFixed(2);

    // Overall percent: mean of available observation percents (ignore empty)
    const observedPercents = [obs1, obs2]
      .filter((x) => x.count > 0)
      .map((x) => x.percent);
    const overallPercent = observedPercents.length
      ? +(
          observedPercents.reduce((a, b) => a + b, 0) / observedPercents.length
        ).toFixed(2)
      : 0;

    // New overall weighted observation percent (summing weighted contributions of obs1 & obs2)
    const overallWeightedObservation = +(
      totalWeighted1 + totalWeighted2
    ).toFixed(2);
    // Individual 0..100 scales for each section (already weighted by subcategory weights)
    const weightedSelf = totalWeightedSelf; // 0..100
    const weightedObs1 = totalWeighted1; // 0..100
    const weightedObs2 = totalWeighted2; // 0..100

    const labelSelf = this.getTarafLabel(weightedSelf);
    const labelObs1 = this.getTarafLabel(weightedObs1);
    const labelObs2 = this.getTarafLabel(weightedObs2);

    // Average across the three sections (excluding those with 0 if desired)
    const presentWeighted = [weightedSelf, weightedObs1, weightedObs2].filter(
      (v) => v > 0,
    );
    const triAverageWeighted = presentWeighted.length
      ? +(
          presentWeighted.reduce((a, b) => a + b, 0) / presentWeighted.length
        ).toFixed(2)
      : 0;

    const scale = (() => {
      // Try to infer scale from first question
      const s = evaluation.questions_snapshot[0]?.maxScore;
      return typeof s === 'number' && s > 0 ? s : 4;
    })();

    const overallAvgScore =
      scale > 0 ? +((overallPercent / 100) * scale).toFixed(2) : 0;
    // Label based on weighted observation total (fallback to previous if zero)
    // Performance basis now uses tri-section average if available, else combined observations, else raw percent
    const performanceBasis =
      triAverageWeighted > 0
        ? triAverageWeighted
        : overallWeightedObservation > 0
          ? overallWeightedObservation
          : overallPercent;

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
        label: labelSelf,
      },
      observation1: {
        ...obs1,
        status: evaluation.observation_1?.status || 'pending',
        submittedAt: evaluation.observation_1?.submittedAt || null,
        label: labelObs1,
      },
      observation2: {
        ...obs2,
        status: evaluation.observation_2?.status || 'pending',
        submittedAt: evaluation.observation_2?.submittedAt || null,
        label: labelObs2,
      },
      categories: {
        breakdown: catBreakdown,
        totals: {
          selfRawAchieved: totalRawAchievedSelf,
          observation1RawAchieved: totalRawAchieved1,
          observation2RawAchieved: totalRawAchieved2,
          fullMarkSum: totalFullMarks,
          selfPercent:
            totalFullMarks > 0
              ? +((totalRawAchievedSelf / totalFullMarks) * 100).toFixed(2)
              : 0,
          observation1Percent:
            totalFullMarks > 0
              ? +((totalRawAchieved1 / totalFullMarks) * 100).toFixed(2)
              : 0,
          observation2Percent:
            totalFullMarks > 0
              ? +((totalRawAchieved2 / totalFullMarks) * 100).toFixed(2)
              : 0,
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
    const template = await this.pentadbirService.getTemplateById(
      dto.templateId,
    );
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
      .select(
        'period teacherId status subject class self_evaluation observation_1 observation_2 createdAt',
      )
      .sort({ status: 1, createdAt: -1 })
      .exec();
  }

  /**
   * Get all evaluations for admin overview (including completed).
   */
  async getAllEvaluationsForAdmin(): Promise<Cerapan[]> {
    return this.cerapanModel
      .find({})
      .select(
        'period teacherId status subject class self_evaluation observation_1 observation_2 createdAt scheduledDate scheduledTime observerName templateRubric notes observationType',
      )
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
    if (
      evaluation.status !== 'pending_observation_1' &&
      evaluation.status !== 'pending_self_evaluation'
    ) {
      throw new BadRequestException(
        `This evaluation is not ready for Observation 1. Current status: ${evaluation.status}. Expected: pending_observation_1 or pending_self_evaluation.`,
      );
    }
    if (
      !Array.isArray(evaluation.questions_snapshot) ||
      evaluation.questions_snapshot.length === 0
    ) {
      throw new BadRequestException(
        'Evaluation has no question snapshot to score',
      );
    }
    if (!evaluation.observation_1) {
      evaluation.observation_1 = {
        status: 'pending',
        submittedAt: null,
        answers: [],
        marks: [],
        administratorId: undefined,
      };
    }
    // Normalize & validate marks against snapshot
    const snapshotIds = new Set(
      evaluation.questions_snapshot.map((q) => q.questionId),
    );
    const normalized = [] as {
      questionId: string;
      mark: number;
      comment?: string;
    }[];
    for (const m of dto.marks || []) {
      if (!m || typeof m.questionId !== 'string') continue;
      if (!snapshotIds.has(m.questionId)) continue; // ignore unknown questionIds
      const q = evaluation.questions_snapshot.find(
        (q) => q.questionId === m.questionId,
      );
      const max = q?.maxScore ?? 0;
      let markNum = Number(m.mark);
      if (Number.isNaN(markNum)) markNum = 0;
      if (markNum < 0) markNum = 0;
      if (markNum > max) markNum = max;
      const entry: { questionId: string; mark: number; comment?: string } = {
        questionId: m.questionId,
        mark: markNum,
      };
      if (typeof m.comment === 'string' && m.comment.trim().length > 0) {
        entry.comment = m.comment.trim();
      }
      normalized.push(entry);
    }
    if (!normalized.length) {
      throw new BadRequestException(
        'No valid marks provided for Observation 1',
      );
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

      console.error(
        'Error saving Observation 1 marks:',
        err?.message,
        err?.errors || err,
      );
      const detail =
        typeof err?.message === 'string' ? err.message : 'Unknown error';
      throw new BadRequestException({
        message: 'Failed to save Observation 1 marks',
        detail,
      });
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
    if (
      !Array.isArray(evaluation.questions_snapshot) ||
      evaluation.questions_snapshot.length === 0
    ) {
      throw new BadRequestException(
        'Evaluation has no question snapshot to score',
      );
    }
    if (!evaluation.observation_2) {
      evaluation.observation_2 = {
        status: 'pending',
        submittedAt: null,
        answers: [],
        marks: [],
        administratorId: undefined,
      };
    }
    const snapshotIds = new Set(
      evaluation.questions_snapshot.map((q) => q.questionId),
    );
    const normalized = [] as {
      questionId: string;
      mark: number;
      comment?: string;
    }[];
    for (const m of dto.marks || []) {
      if (!m || typeof m.questionId !== 'string') continue;
      if (!snapshotIds.has(m.questionId)) continue;
      const q = evaluation.questions_snapshot.find(
        (q) => q.questionId === m.questionId,
      );
      const max = q?.maxScore ?? 0;
      let markNum = Number(m.mark);
      if (Number.isNaN(markNum)) markNum = 0;
      if (markNum < 0) markNum = 0;
      if (markNum > max) markNum = max;
      const entry: { questionId: string; mark: number; comment?: string } = {
        questionId: m.questionId,
        mark: markNum,
      };
      if (typeof m.comment === 'string' && m.comment.trim().length > 0) {
        entry.comment = m.comment.trim();
      }
      normalized.push(entry);
    }
    if (!normalized.length) {
      throw new BadRequestException(
        'No valid marks provided for Observation 2',
      );
    }
    evaluation.observation_2.marks = normalized;
    evaluation.observation_2.status = 'submitted';
    evaluation.observation_2.submittedAt = new Date();
    evaluation.observation_2.administratorId = adminId;
    evaluation.status = 'marked';
    try {
      await evaluation.save();
    } catch (err: any) {
      console.error(
        'Error saving Observation 2 marks:',
        err?.message,
        err?.errors || err,
      );
      const detail =
        typeof err?.message === 'string' ? err.message : 'Unknown error';
      throw new BadRequestException({
        message: 'Failed to save Observation 2 marks',
        detail,
      });
    }
    await this.checkAndGenerateAiComment(evaluation);
    return evaluation;
  }

  private async generateAiComment(
    evaluation: Cerapan,
    summary: ReturnType<CerapanService['computeSummary']>,
  ): Promise<string> {
    if (!this.aiModel) {
      return 'AI cannot generate comment.';
    }

    const breakdown = summary.categories.breakdown;
    const overallScore = summary.overall.triAverageWeighted;
    const label = summary.overall.label;
    const obs1Score = summary.overall.weightedObservation1;
    const obs2Score = summary.overall.weightedObservation2;

    const availableCategories = breakdown.filter(
      (cat: any) => cat.weighted1 > 0 || cat.weighted2 > 0,
    );

    const combinedScores = availableCategories.map((cat: any) => ({
      code: cat.code,
      avgWeighted: (cat.weighted1 + cat.weighted2) / 2,
    }));

    const strongest = combinedScores.sort(
      (a, b) => b.avgWeighted - a.avgWeighted,
    )[0];
    const weakest = combinedScores.sort(
      (a, b) => a.avgWeighted - b.avgWeighted,
    )[0];

    const strongestArea = strongest
      ? `${strongest.code} (Skor: ${strongest.avgWeighted.toFixed(2)}%)`
      : 'Tiada Kekuatan Jelas (N/A)';
    const weakestArea = weakest
      ? `${weakest.code} (Skor: ${weakest.avgWeighted.toFixed(2)}%)`
      : 'Tiada Kelemahan Jelas (N/A)';

    let categoryDetails = 'Performance Breakdown (Weighted Percentage):\n';
    breakdown.forEach((cat) => {
      const catObs1 = cat.weighted1 > 0 ? `${cat.weighted1}%` : 'N/A';
      const catObs2 = cat.weighted2 > 0 ? `${cat.weighted2}%` : 'N/A';
      categoryDetails += `- ${cat.code} (Weight ${cat.weight}%)：Cerapan 1: ${catObs1}, Cerapan 2: ${catObs2}\n`;
    });

    const systemPrompt = `
You are a seasoned educational assessment expert.

Your task is to help generate a generic teaching performance appraisal comment.

Strict rules:
1. Do not identify real individuals; refer only to "this teacher".
2. Use only the provided data; do not invent new information.
3. The comment must be bilingual (Malay and English) in a single short paragraph.
4. The tone must be professional, encouraging, and focused on strengths plus one area for improvement.
5. Target length: about 100–150 characters, concise but meaningful.
`;
    const userPrompt = `
Generate a bilingual Malay + English appraisal comment.

Requirements:
- Begin with the Overall Evaluation Label: ${label}
- Highlight the strongest area (highest scoring sub-category)
- Give one improvement suggestion for the weakest area
- Keep it professional and encouraging

Assessment Data:
- Class: ${evaluation.class}
- Overall Score: ${overallScore}%
- Obs 1: ${obs1Score}%
- Obs 2: ${obs2Score}%

Category Details:
${categoryDetails}

Write the final comment now.
`;
    // const prompt = `
    //     You are a seasoned educational assessment expert tasked with writing the final teaching performance appraisal comment for the teacher of ${evaluation.subject}.

    //     **Instructions:**
    //     1.  **Language:** The entire comment must be written in **Malay** and **English** (bilingual).
    //     2.  **Format:** The comment should be a single, brief, professional, and insightful paragraph, approximately 100-150 characters long.
    //     3.  **Content:**
    //         a.  Start by mentioning the **Overall Evaluation Label** (${label}).
    //         b.  Highlight the **strongest area** (the sub-category with the highest score) as the primary strength.
    //         c.  Provide one **specific suggestion for improvement** targeting the **weakest area** (the sub-category with the lowest score).
    //         d.  Maintain a professional and encouraging tone.

    //     **Assessment Data (Total 100%):**
    //     -   Teacher: ${evaluation.subject} Teacher, Class ${evaluation.class}
    //     -   Overall Weighted Average Score: ${overallScore}%
    //     -   Overall Evaluation Label: ${label}
    //     -   Principal Observation 1 (Obs 1): ${obs1Score}%
    //     -   Principal Observation 2 (Obs 2): ${obs2Score}%

    //     ${categoryDetails}

    //     Based on the data above, generate the summary appraisal comment in Malay and English.
    //   `;

    try {
      const response = await this.aiModel.generateContent({
        systemInstruction: systemPrompt,
        //  {
        //   role: 'system',
        //   parts: [
        //     {
        //       text: systemPrompt,
        //     },
        //   ],
        // },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 500,
        },
      });

      const rawText = (response as any).text;

      if (!rawText || typeof rawText !== 'string' || rawText === '') {
        const refusalReason =
          (response as any).promptFeedback?.blockReason ||
          'Empty response object.';

        const dataTemplate = `
[MODEL REFUSED GENERATION]
Taraf Keseluruhan (Overall Taraf): ${label} (${overallScore}%)
Kekuatan Utama (Strongest Area): ${strongestArea}
Bidang Pembangunan (Development Area): ${weakestArea}

Maklum Balas: Komen terperinci tidak dapat dijana kerana sekatan model AI. / Detailed comment not generated due to AI model restrictions.
            `.trim();

        console.warn(
          `[AI REFUSAL] Using fallback template. Reason: ${refusalReason}`,
        );
        return dataTemplate;
      }

      return rawText.trim();
      // if (!result.response.text) {
      //   throw new Error('Gemini returned empty response.');
      // }
      // return result.response.text().trim();
    } catch (error) {
      console.error('❌ Gemini API Error in CerapanService:', error);
      const errorMessage = error.message || 'Unknown API or network error';

      return `Kesilapan kritikal API: Gagal menyambung ke servis AI. / Critical API error: Failed to connect to AI service. Detail: ${errorMessage.substring(0, 50)}...`;
      // throw new InternalServerErrorException('AI service fail.');
    }
  }

  private async checkAndGenerateAiComment(
    evaluation: Cerapan,
  ): Promise<boolean> {
    const isSelfSubmitted = evaluation.self_evaluation?.status === 'submitted';
    const isObs2Submitted = evaluation.observation_2?.status === 'submitted';
    const isCommentMissing = !evaluation.aiComment;

    // only when Kendiri & Obs 2 finish，and AI comment is null
    if (isSelfSubmitted && isObs2Submitted && isCommentMissing) {
      let aiComment: string; //= 'Failed to generate AI comment / Gagal menjana komen AI.';
      const aiUserId = evaluation.teacherId;

      try {
        // 1. 重新计算最新的总结数据
        const summary = this.computeSummary(evaluation);

        // 2. 生成双语 AI 评论
        aiComment = await this.generateAiComment(evaluation, summary);

        // 3. 记录 AI Usage
        if (this.usageModel) {
          await this.usageModel.create({
            userId: aiUserId,
            usageType: 'Cerapan Comment',
            provider: 'Gemini',
            model: 'gemini-2.5-flash',
          });
        }
      } catch (err) {
        console.error('Error generating AI comment or logging usage:', err);
        // aiComment = `AI GENERATION FAILED. Detail: ${err.message || 'Unknown Runtime Error'}`;
        aiComment =
          'Kesilapan semasa proses janakuasa AI. Sila semak log. / Runtime error during AI generation. Check console.';
        evaluation.aiComment = aiComment;
        await evaluation.save();
        return false;
      }
      // 4. 更新文档
      evaluation.aiComment = aiComment;
      await evaluation.save(); // 提前保存 AI 评论
      return true;
    }
    return false;
  }

  async forceGenerateAiComment(evaluationId: string): Promise<Cerapan> {
    const evaluation = await this.cerapanModel.findById(evaluationId).exec();

    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }

    const isSelfSubmitted = evaluation.self_evaluation?.status === 'submitted';
    const isObs2Submitted = evaluation.observation_2?.status === 'submitted';

    // 检查前提条件：必须是已完成提交的状态
    if (!isSelfSubmitted || !isObs2Submitted) {
      throw new BadRequestException(
        'Cannot force generate: Self-evaluation and Observation 2 must both be submitted.',
      );
    }

    // 关键步骤：如果 aiComment 字段存在，将其暂时移除，强制 checkAndGenerateAiComment 重新运行。
    // Mongoose 的 $unset 操作或直接设为 undefined 都可以。
    if (evaluation.aiComment) {
      evaluation.aiComment = undefined;
      await evaluation.save(); // 先保存以确保 Mongoose 知道这个字段被清除了
    }

    // 触发核心检查和生成逻辑
    await this.checkAndGenerateAiComment(evaluation);

    // 重新获取并返回更新后的评估
    return evaluation;
  }
}
