import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RphController } from './rph.controller';
import { RphService } from './rph.service';
import { RPH, RphSchema } from './schemas/rph.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: RPH.name, schema: RphSchema }])],
  controllers: [RphController],
  providers: [RphService],
})
export class RphModule {}
