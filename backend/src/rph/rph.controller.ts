import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { RphService } from './rph.service';
import { CreateRphDto } from './dto/create-rph.dto';
import { UpdateRphDto } from './dto/update-rph.dto';
import { RequestRphDto } from './dto/request-rph.dto';

@Controller('rph')
export class RphController {
  constructor(private readonly rphService: RphService) {}

  @Post()
  create(@Body() dto: CreateRphDto) {
    return this.rphService.create(dto);
  }

  @Get()
  findAll() {
    return this.rphService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rphService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRphDto) {
    return this.rphService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rphService.remove(id);
  }
  @Post('generate')
  generate(@Body() dto: RequestRphDto) {
    return this.rphService.generateRPH(dto);
  }
}
