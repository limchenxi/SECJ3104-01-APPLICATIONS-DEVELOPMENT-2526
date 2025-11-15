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
import { SelfStartEvaluationDto } from './dto/self-start-evaluation.dto';
import { SubmitObservationDto } from './dto/submit-cerapan.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('cerapan') // Base route: /cerapan
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class CerapanController {
  constructor(private readonly cerapanService: CerapanService) {}

  @Post('start')
  // @UseGuards(AdminAuthGuard) // You should protect this for Admins only
  createEvaluation(@Body() dto: CreateEvaluationDto) {
    // Body will contain { teacherId, templateId, period }
    return this.cerapanService.createEvaluation(dto);
  }
  @Post('self-start')
  startSelfEvaluation(
    @Body() dto: SelfStartEvaluationDto,
    @Req() req: RequestWithUser,
  ) {
    const teacherId = (req.user._id as any).toString();
    return this.cerapanService.createTeacherSelfEvaluation(teacherId, dto);
  }

  @Get('admin/tasks')
  // @UseGuards(AdminAuthGuard)
  getAdminPendingTasks() {
    return this.cerapanService.getAdminPendingTasks();
  }

  @Get('admin/task/:id')
  // @UseGuards(AdminAuthGuard)
  getAdminTaskDetails(@Param('id') evaluationId: string) {
    return this.cerapanService.getEvaluationByIdAdmin(evaluationId);
  }

  
  @Put('observation-1/:id')
  // @UseGuards(AdminAuthGuard)
  submitObservation1(
    @Param('id') evaluationId: string,
    @Body() dto: SubmitObservationDto,
    @Req() req: RequestWithUser,
  ) {
    const adminId = req.user.name || (req.user._id as any).toString();
    return this.cerapanService.submitObservation1(
      evaluationId,
      dto,
      adminId,
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
    @Req() req: RequestWithUser,
  ) {
    const adminId = req.user.name || (req.user._id as any).toString();
    return this.cerapanService.submitObservation2(
      evaluationId,
      dto,
      adminId,
    );
  }

  /**
   * (ADMIN) Get full report with computed summary for any evaluation (no teacher restriction).
   * GET /cerapan/admin/report/:id/summary
   */
  @Get('admin/report/:id/summary')
  // @UseGuards(AdminAuthGuard)
  getAdminReportSummary(@Param('id') evaluationId: string) {
    return this.cerapanService.getAdminReportWithSummary(evaluationId);
  }

 
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


  @Get('my-reports')
  getMyReportHistory(@Req() req: RequestWithUser) {
    const teacherId = (req.user._id as any).toString();
    return this.cerapanService.getMyReportHistory(teacherId);
  }

  
  @Get('report/:id')
  getReportDetails(
    @Param('id') evaluationId: string,
    @Req() req: RequestWithUser,
  ) {
    const teacherId = (req.user._id as any).toString();
    return this.cerapanService.getCompletedReport(evaluationId, teacherId);
  }

  /**
   * (TEACHER) Get full report with computed summary (scores/percentages).
   * GET /cerapan/report/:id/summary
   */
  @Get('report/:id/summary')
  getReportSummary(
    @Param('id') evaluationId: string,
    @Req() req: RequestWithUser,
  ) {
    const teacherId = (req.user._id as any).toString();
    return this.cerapanService.getReportWithSummary(evaluationId, teacherId);
  }
}