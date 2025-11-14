import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TeachingAssignment,
  TeachingAssignmentSchema,
} from './schemas/teachingAssignment.schema';
import { TeachingAssignmentController } from './teaching-assignment.controller';
import { TeachingAssignmentService } from './teaching-assignment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TeachingAssignment.name, schema: TeachingAssignmentSchema },
    ]),
  ],
  controllers: [TeachingAssignmentController],
  providers: [TeachingAssignmentService],
})
export class TeachingAssignmentModule {}
