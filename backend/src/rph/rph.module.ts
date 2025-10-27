import { Module } from '@nestjs/common';
import { RphService } from './rph.service';
import { RphController } from './rph.controller';

@Module({
  providers: [RphService],
  controllers: [RphController]
})
export class RphModule {}
