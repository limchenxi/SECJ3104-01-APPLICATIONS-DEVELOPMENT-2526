import {
  Controller,
  Get,
  Put,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SchoolService } from './school.service';
import { School } from './schemas/school.schema';
import { UpdateSchoolDTO } from './dto/update-school.dto';

@Controller('school-setting')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get()
  async getSettings(): Promise<School> {
    return this.schoolService.getSettings();
  }

  @Put()
  async updateSettings(
    @Body() updateSchoolDto: UpdateSchoolDTO,
  ): Promise<School> {
    return this.schoolService.updateSettings(updateSchoolDto);
  }
}
