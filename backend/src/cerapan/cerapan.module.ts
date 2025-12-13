import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CerapanController } from './cerapan.controller';
import { CerapanService } from './cerapan.service';
import { Cerapan, CerapanSchema } from './cerapan.schema';
import { PentadbirModule } from '../pentadbir/pentadbir.module';
import { AiModule } from 'src/ai/ai.module';
import { TeachingAssignment } from 'src/teaching-assignment/teaching-assignment.schema';
import { TeachingAssignmentModule } from 'src/teaching-assignment/teaching-assignment.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cerapan.name, schema: CerapanSchema }]),
    PentadbirModule,
    AiModule,
    TeachingAssignmentModule,
  ],
  controllers: [CerapanController],
  providers: [CerapanService],
  exports: [CerapanService],
})
export class CerapanModule {}
