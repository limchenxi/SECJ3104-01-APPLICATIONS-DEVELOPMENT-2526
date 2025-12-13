import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TeachingAssignment,
  TeachingAssignmentSchema,
} from './teaching-assignment.schema';
import { TeachingAssignmentService } from './teaching-assignment.service';
import { TeachingAssignmentController } from './teaching-assignment.controller';
import { Cerapan, CerapanSchema } from '../cerapan/cerapan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TeachingAssignment.name, schema: TeachingAssignmentSchema },
      { name: Cerapan.name, schema: CerapanSchema },
    ]),
  ],
  controllers: [TeachingAssignmentController],
  providers: [TeachingAssignmentService],
  exports: [TeachingAssignmentService],
})
export class TeachingAssignmentModule {}
