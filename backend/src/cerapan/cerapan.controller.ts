import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CerapanService } from './cerapan.service';
import { SubmitCerapankendiriDto } from './dto/submit-cerapankendiri.dto';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { SubmitObservationDto } from './dto/submit-cerapan.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('cerapan') // Base route: /cerapan
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class CerapanController {
  constructor(private readonly cerapanService: CerapanService) {}

  // ===============================================
  // === 1. ADMIN ENDPOINTS (PENTADBIR) ===
  // ===============================================

  /**
   * (ADMIN) Start a new evaluation for a teacher.
   * POST /cerapan/start
   */
  @Post('start')
  // @UseGuards(AdminAuthGuard) // You should protect this for Admins only
  createEvaluation(@Body() dto: CreateEvaluationDto) {
    // Body will contain { teacherId, templateId, period }
    return this.cerapanService.createEvaluation(dto);
  }

  /**
   * (ADMIN) Get the "To-Do" list for all admins.
   * GET /cerapan/admin/tasks
   */
  @Get('admin/tasks')
  // @UseGuards(AdminAuthGuard)
  getAdminPendingTasks() {
    return this.cerapanService.getAdminPendingTasks();
  }

  /**
   * (ADMIN) Submit marks for Observation 1.
   * PUT /cerapan/observation-1/:id
   */
  @Put('observation-1/:id')
  // @UseGuards(AdminAuthGuard)
  submitObservation1(
    @Param('id') evaluationId: string,
    @Body() dto: SubmitObservationDto,
    /*@GetUser() admin: User*/
  ) {
    // ---- FAKE ADMIN ID (replace with real user from @GetUser()) ----
    const fakeAdminId = 'Admin_Ahmad';
    // ----
    // return this.cerapanService.submitObservation1(evaluationId, dto, admin.id);
    return this.cerapanService.submitObservation1(
      evaluationId,
      dto,
      fakeAdminId,
    );
  }

  /**
   * (ADMIN) Submit marks for Observation 2.
   * PUT /cerapan/observation-2/:id
   */
  @Put('observation-2/:id')
  // @UseGuards(AdminAuthGuard)
  submitObservation2(
    @Param('id') evaluationId: string,
    @Body() dto: SubmitObservationDto,
    /*@GetUser() admin: User*/
  ) {
    // ---- FAKE ADMIN ID (replace with real user from @GetUser()) ----
    const fakeAdminId = 'Admin_Halim';
    // ----
    // return this.cerapanService.submitObservation2(evaluationId, dto, admin.id);
    return this.cerapanService.submitObservation2(
      evaluationId,
      dto,
      fakeAdminId,
    );
  }

  // ===============================================
  // === 2. TEACHER ENDPOINTS (GURU) ===
  // ===============================================

  /**
   * (TEACHER) Get the list of pending "self-evaluation" tasks.
   * GET /cerapan/my-tasks
   */
  @Get('my-tasks')
  getMyPendingTasks(@Req() req: RequestWithUser) {
    const teacherId = (req.user._id as any).toString();
    return this.cerapanService.getMyPendingTasks(teacherId);
  }

  /**
   * (TEACHER) Get the details and questions for ONE pending task.
   * GET /cerapan/task/:id
   */
  @Get('task/:id')
  getTaskDetails(
    @Param('id') evaluationId: string,
    @Req() req: RequestWithUser,
  ) {
    const teacherId = (req.user._id as any).toString();
    return this.cerapanService.getEvaluationForTask(evaluationId, teacherId);
  }

  /**
   * (TEACHER) Submit the "self-evaluation" (cerapan kendiri) form.
   * PUT /cerapan/self-evaluation/:id
   */
  @Put('self-evaluation/:id')
  submitSelfEvaluation(
    @Param('id') evaluationId: string,
    @Body() dto: SubmitCerapankendiriDto, // { answers: [...] }
    @Req() req: RequestWithUser,
  ) {
    const teacherId = (req.user._id as any).toString();
    return this.cerapanService.submitSelfEvaluation(
      evaluationId,
      dto,
      teacherId,
    );
  }

  /**
   * (TEACHER) Get the list of all completed or in-progress reports.
   * GET /cerapan/my-reports
   */
  @Get('my-reports')
  getMyReportHistory(@Req() req: RequestWithUser) {
    const teacherId = (req.user._id as any).toString();
    return this.cerapanService.getMyReportHistory(teacherId);
  }

  /**
   * (TEACHER) Get the full details of ONE report (to see overall results).
   * GET /cerapan/report/:id
   */
  @Get('report/:id')
  getReportDetails(
    @Param('id') evaluationId: string,
    @Req() req: RequestWithUser,
  ) {
    const teacherId = (req.user._id as any).toString();
    return this.cerapanService.getCompletedReport(evaluationId, teacherId);
  }
}