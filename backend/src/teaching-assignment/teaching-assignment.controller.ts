import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { TeachingAssignmentService } from './teaching-assignment.service';
import { CreateTeachingAssignmentDto } from './dto/createTeachingAssignment.dto';

@Controller('teaching-assignments')
export class TeachingAssignmentController {
  constructor(private service: TeachingAssignmentService) {}

  @Post()
  create(@Body() dto: CreateTeachingAssignmentDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('teacher/:teacherId')
  findByTeacher(@Param('teacherId') teacherId: string) {
    return this.service.findByTeacher(teacherId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
