import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { TeachingAssignmentService } from './teaching-assignment.service';
import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

type RequestWithUser = any;

@Controller('teaching-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachingAssignmentController {
  constructor(private readonly service: TeachingAssignmentService) {}


  @Get('me')
  async getMine(@Req() req: RequestWithUser, @Query('year') year?: string, @Query('term') term?: string) {
    const teacherId = (req.user._id as any).toString();
    return this.service.getForTeacher(teacherId);
  }

  @Get('me/available-for-cerapan')
  async getAvailableForCerapan(
    @Req() req: RequestWithUser, 
    @Query('period') period: string,
  ) {
    const teacherId = (req.user._id as any).toString();
    return this.service.getAvailableForCerapan(teacherId, period);
  }

  @Get()
  @Roles('PENTADBIR', 'SUPERADMIN')
  async list(
    @Query('teacherId') teacherId?: string,
    @Query('subject') subject?: string,
    @Query('class') className?: string,
    @Query('active') active?: string,
  ) {
    const filter: any = {};
    if (teacherId) filter.teacherId = teacherId;
    if (subject) filter.subject = subject;
    if (className) filter.class = className;
    if (active !== undefined) filter.active = active === 'true';
    return this.service.findAll(filter);
  }

  // Admin: create
  @Post()
  @Roles('PENTADBIR', 'SUPERADMIN')
  async create(@Body() dto: CreateTeachingAssignmentDto) {
    return this.service.create(dto);
  }

  // Admin: update
  @Patch(':id')
  @Roles('PENTADBIR', 'SUPERADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateTeachingAssignmentDto) {
    return this.service.update(id, dto);
  }

  // Admin: delete
  @Delete(':id')
  @Roles('PENTADBIR', 'SUPERADMIN')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true };
  }
}
