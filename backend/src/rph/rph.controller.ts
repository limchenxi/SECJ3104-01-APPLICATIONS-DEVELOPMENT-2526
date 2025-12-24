import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.strategy';
import { RphService } from './rph.service';
import { CreateRphDto } from './dto/create-rph.dto';
import { UpdateRphDto } from './dto/update-rph.dto';
import { RequestRphDto } from './dto/request-rph.dto';

@Controller('rph')
@UseGuards(JwtAuthGuard)
export class RphController {
  constructor(private readonly rphService: RphService) { }

  @Post()
  create(@Body() dto: CreateRphDto) {
    return this.rphService.create(dto);
  }

  @Get()
  findAll(@Request() req: any) {
    // console.log('User accessing history:', req.user);
    const userId = req.user?._id;
    if (!userId) return []; // Should be handled by Guard, but safe check
    return this.rphService.findByUserId(userId);
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
  generate(@Body() dto: RequestRphDto, @Request() req: any) {
    const realUserId = req.user?._id;
    if (!realUserId) throw new Error("User ID missing");

    return this.rphService.generateRPH(dto, realUserId);
  }
}
