import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeachingAssignment, TeachingAssignmentSchema } from './teaching-assignment.schema';
import { TeachingAssignmentService } from './teaching-assignment.service';
import { TeachingAssignmentController } from './teaching-assignment.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TeachingAssignment.name, schema: TeachingAssignmentSchema },
    ]),
  ],
  controllers: [TeachingAssignmentController],
  providers: [TeachingAssignmentService],
  exports: [TeachingAssignmentService],
})
export class TeachingAssignmentModule {}
