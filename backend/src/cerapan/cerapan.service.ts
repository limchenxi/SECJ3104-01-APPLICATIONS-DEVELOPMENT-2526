import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, MongooseError } from 'mongoose';
import {
  AdminMark,
  Cerapan,
  ObservationSection,
  QuestionSnapshot,
} from './cerapan.schema';
import { SubmitCerapankendiriDto } from './dto/submit-cerapankendiri.dto';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { PentadbirService } from '../pentadbir/pentadbir.service';
import { MarkDto, SubmitObservationDto } from './dto/submit-cerapan.dto';
// import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI, Models } from '@google/genai';
import { AI_USAGE_MODEL_NAME, AiUsage } from 'src/ai/schemas/ai-usage.schema';

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
  private aiModel: Models | null = null;
  constructor(
    @InjectModel(Cerapan.name) private cerapanModel: Model<Cerapan>,
    private readonly pentadbirService: PentadbirService,
    // 【新增注入】 - 用于记录 AI 使用量
    @InjectModel(AI_USAGE_MODEL_NAME) private usageModel: Model<AiUsage>,
  ) {
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      console.error('❌ GEMINI_API_KEY missing in environment variables');
    } else {
      const genAI = new GoogleGenAI({ apiKey: key });

      this.aiModel = genAI.models;
    }
  }
  private getTarafLabel(score: number): string {
    if (score >= 85) return 'CEMERLANG';
    if (score >= 70) return 'BAIK';
    if (score >= 55) return 'SEDERHANA';
    if (score >= 0) return 'PERLU TINDAKAN SEGERA';
    return 'Tidak Dinilai';
  }

  // Admin: Start Cerapan 1 for an evaluation (set status and prepare observation_1)
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
      evaluation.status = 'marked';
    } else if (evaluation.observation_1.status === 'submitted') {
      evaluation.status = 'pending_observation_2';
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
      if (performanceBasis >= 70) return 'Baik';
      if (performanceBasis >= 55) return 'Sederhana';
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

  // Return report plus computed summary for teacher.
  async getReportWithSummary(evaluationId: string, teacherId: string) {
    const report = await this.getCompletedReport(evaluationId, teacherId);
    const summary = this.computeSummary(report);
    return { report, summary };
  }

  //(ADMIN) Return report plus computed summary for any evaluation (no teacher restriction).
  async getAdminReportWithSummary(evaluationId: string) {
    const report = await this.cerapanModel.findById(evaluationId).exec();
    if (!report) {
      throw new NotFoundException('Evaluation not found');
    }
    const summary = this.computeSummary(report);
    return { report, summary };
  }

  // (Demo helpers removed)
  // Teacher initiates their own self-evaluation (same logic as admin createEvaluation but teacherId derived from JWT).
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

  //1. Get the "To-Do" list for all administrators.
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

  // Get all evaluations for admin overview (including completed).
  async getAllEvaluationsForAdmin(): Promise<Cerapan[]> {
    return this.cerapanModel
      .find({})
      .select(
        'period teacherId status subject class self_evaluation observation_1 observation_2 createdAt scheduledDate scheduledTime observerName templateRubric notes observationType',
      )
      .sort({ createdAt: -1 })
      .exec();
  }

  private dtoToAdminMark(
    marks: MarkDto[],
    questions: QuestionSnapshot[],
  ): AdminMark[] {
    const snapshotIds = new Set(questions.map((q) => q.questionId));
    const result: AdminMark[] = [];
    for (const m of marks) {
      if (!m || typeof m.questionId !== 'string') continue;
      if (!snapshotIds.has(m.questionId)) continue;
      const q = questions.find((q) => q.questionId === m.questionId);
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
      result.push(entry);
    }
    return result;
  }

  //2. Submit marks for Observation 1.
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
    const adminMarks = this.dtoToAdminMark(
      dto.marks,
      evaluation.questions_snapshot,
    );

    if (!adminMarks.length) {
      throw new BadRequestException(
        'No valid marks provided for Observation 1',
      );
    }

    Object.assign(evaluation.observation_1, {
      marks: adminMarks,
      status: 'submitted',
      submittedAt: new Date(),
      administratorId: adminId,
    });
    evaluation.status = 'pending_observation_2';

    // Reset schedule fields for Cerapan 2
    Object.assign(evaluation, {
      scheduledDate: undefined,
      scheduledTime: undefined,
      observerName: undefined,
      templateRubric: undefined,
      notes: undefined,
      observationType: undefined,
    });

    try {
      return await evaluation.save();
    } catch (err: any) {
      // Log detailed error for debugging
      if (!(err instanceof MongooseError)) {
        throw err;
      }
      console.error(
        'Error saving Observation 1 marks:',
        err?.message,
        err?.stack || err,
      );
      const detail =
        typeof err?.message === 'string' ? err.message : 'Unknown error';
      throw new BadRequestException({
        message: 'Failed to save Observation 1 marks',
        detail,
      });
    }
  }

  // 3. Submit marks for Observation 2.

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

    const adminMarks = this.dtoToAdminMark(
      dto.marks,
      evaluation.questions_snapshot,
    );

    if (!adminMarks.length) {
      throw new BadRequestException(
        'No valid marks provided for Observation 2',
      );
    }

    Object.assign(evaluation.observation_2, {
      marks: adminMarks,
      status: 'submitted',
      submittedAt: new Date(),
      administratorId: adminId,
    });

    evaluation.status = 'marked';
    try {
      await evaluation.save();
    } catch (err: any) {
      // Log detailed error for debugging
      if (!(err instanceof MongooseError)) {
        throw err;
      }
      console.error(
        'Error saving Observation 2 marks:',
        err?.message,
        err?.stack || err,
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
      (cat) => cat.weighted1 > 0 || cat.weighted2 > 0,
    );
    const combinedScores = availableCategories.map((cat) => ({
      code: cat.code,
      avgWeighted: (cat.weighted1 + cat.weighted2) / 2,
    }));

    // const strongest = combinedScores.sort(
    //   (a, b) => b.avgWeighted - a.avgWeighted,
    // )[0];
    // const weakest = combinedScores.sort(
    //   (a, b) => a.avgWeighted - b.avgWeighted,
    // )[0];

    const codeDescriptionMap: Record<string, string> = {
      '4.1.1': 'Perancangan PdPc / Planning',
      '4.2.1': 'Mengelola proses pembelajaran / Managing learning process',
      '4.2.2': 'Mengelola suasana pembelajaran / Managing learning environment',
      '4.3.1': 'Bimbingan murid / Guiding students',
      '4.4.1': 'Mendorong minda & tindakan murid / Motivating mind & actions',
      '4.4.2': 'Mendorong emosi murid / Motivating student emotions',
      '4.5.1': 'Pelaksanaan pentaksiran / Assessment implementation',
      '4.6.1': 'Penglibatan aktif murid / Active student engagement',
    };
    const strongest = combinedScores.sort(
      (a, b) => b.avgWeighted - a.avgWeighted,
    )[0];
    const weakest = combinedScores.sort(
      (a, b) => a.avgWeighted - b.avgWeighted,
    )[0];

    const strongestDescription =
      codeDescriptionMap[strongest?.code || ''] ||
      'Data score is not conclusive.';
    const weakestDescription =
      codeDescriptionMap[weakest?.code || ''] ||
      'Data score is not conclusive.';

    const strongestArea = strongest
      ? `Kekuatan Utama: ${strongestDescription} (${strongest.code})`
      : 'Tiada Kekuatan Jelas (N/A)';
    const weakestArea = weakest
      ? `Bidang Pembangunan: ${weakestDescription} (${weakest.code})`
      : 'Tiada Kelemahan Jelas (N/A)';
    const strongestAreaDesc = 'Tiada Kekuatan Jelas (N/A)'; // Simplified as we rely on detailed feedback list
    const weakestAreaDesc = 'Tiada Kelemahan Jelas (N/A)'; // Simplified as we rely on detailed feedback list
    const detailedDataForAI = breakdown.map((b) => ({
      code: b.code,
      desc: codeDescriptionMap[b.code],
      score: b.weighted1 || b.weighted2 || b.weightedSelf,
      taraf: this.getTarafLabel(b.weighted1 || b.weighted2 || b.weightedSelf),
    }));

    // 定义强制 JSON Schema
    const responseSchema = {
      type: 'OBJECT',
      properties: {
        overall_summary_malay: { type: 'STRING' },
        overall_summary_english: { type: 'STRING' },
        detailed_feedback: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              code: { type: 'STRING' },
              strength_or_development: { type: 'STRING' }, // 'Strength' or 'Development'
              feedback_malay: {
                type: 'STRING',
                description: 'One constructive observation sentence in Malay.',
              },
              feedback_english: {
                type: 'STRING',
                description:
                  'One constructive observation sentence in English.',
              },
            },
            required: [
              'code',
              'strength_or_development',
              'feedback_malay',
              'feedback_english',
            ],
          },
        },
      },
      required: [
        'overall_summary_malay',
        'overall_summary_english',
        'detailed_feedback',
      ],
    };

    const createFallbackTemplate = (reason: string, detail: string = '') => {
      return `
    [MODEL REFUSED GENERATION]
    Taraf Keseluruhan (Overall Taraf): ${label} (${overallScore}%)
    Kekuatan Utama (Strongest Area): ${strongestArea}
    Bidang Pembangunan (Development Area): ${weakestArea}

    Maklum Balas: ${reason} / Detailed comment not generated.
    Detail Tambahan: ${detail}
    `.trim();
    };

    //     const systemPrompt = `
    // You are a seasoned educational assessment expert.

    // Your task is to help generate a generic teaching performance appraisal comment.

    // Strict rules:
    // 1. Do not identify real individuals; refer only to "this teacher".
    // 2. Use only the provided data; do not invent new information.
    // 3. The comment must be bilingual (Malay and English) in a single short paragraph.
    // 4. The tone must be professional, encouraging, and focused on strengths plus one area for improvement.
    // 5. Target length: approximately 200–300 characters or 2-3 concise sentences. The comment must be highly descriptive.
    // `;
    //     const userPrompt = `
    // Generate a bilingual Malay + English appraisal comment.

    // Requirements:
    // - The comment must incorporate the full description of the strongest and weakest areas (e.g., use "Planning" and "Guiding students," not just "4.1.1" and "4.3.1").
    // - Do not invent new information; base feedback strictly on the data below.
    // - The tone must be constructive and encouraging.
    // - Begin with the Overall Evaluation Label: ${label}
    // - Highlight the strength: Use the full description for **${strongestArea}**.
    // - Suggest improvement: Focus on the full description for **${weakestArea}**.
    // - Keep it professional and encouraging

    // Assessment Data:
    // - Class: ${evaluation.class}
    // - Overall Score: ${overallScore}%
    // - Overall Taraf: ${label}
    // - Strongest Area: ${strongestArea}
    // - Weakest Area: ${weakestArea}

    // Write the final comment now.
    // `;
    const summaryMalay = `Secara keseluruhan, prestasi guru ${evaluation.subject} ini dinilai pada tahap '${label}' (${overallScore.toFixed(2)}%), menunjukkan ${label === 'Cemerlang' || label === 'Baik' ? 'kekuatan yang konsisten dalam pelbagai aspek' : 'beberapa bidang utama yang memerlukan perhatian dan pembangunan segera'}.`;
    const summaryEnglish = `Overall, this ${evaluation.subject} teacher's performance is rated as '${label}' (${overallScore.toFixed(2)}%), demonstrating ${label === 'Cemerlang' || label === 'Baik' ? 'consistent strengths across various aspects' : 'several key areas requiring immediate attention and development'}.`;

    const systemPrompt = `
You are a bilingual educational assessment expert. Your task is to generate a structured performance report using clear text sections and Markdown list formatting.
Your output MUST strictly follow the requested structure and data provided.
`;
    const userPrompt = `
Generate the bilingual appraisal report for the teacher of ${evaluation.subject}.

# 1. Ringkasan Keseluruhan (Overall Summary)
Use the following pre-calculated summary text:

${summaryMalay}
${summaryEnglish}

# 2. Maklum Balas Terperinci (Detailed Feedback)
For every category listed below, generate ONE bilingual bullet point of constructive feedback. The feedback must be informed by the score/Taraf provided in the data.

Assessment Data (Reference):
${JSON.stringify(detailedDataForAI, null, 2)}

Write the final report now.
`;
    try {
      const response = await this.aiModel.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.6,
          maxOutputTokens: 2000,
        },
      });
      const rawText = (response as any).text;

      if (!rawText || typeof rawText !== 'string' || rawText.trim() === '') {
        const refusalReason =
          (response as any).promptFeedback?.blockReason ||
          'Empty text or model safety block.';

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
    } catch (error) {
      console.error('❌ Gemini API Error in CerapanService:', error);
      const errorMessage =
        (error as Error).message || 'Unknown API or network error';
      return createFallbackTemplate(
        'Kesilapan kritikal API: Gagal menyambung ke servis AI.',
        `Error: ${errorMessage.substring(0, 100)}...`,
      );
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
