import { Module } from '@nestjs/common';
import { CerapanService } from './cerapan.service';
import { CerapanController } from './cerapan.controller';

@Module({
  providers: [CerapanService],
  controllers: [CerapanController],
})
export class CerapanModule {}
