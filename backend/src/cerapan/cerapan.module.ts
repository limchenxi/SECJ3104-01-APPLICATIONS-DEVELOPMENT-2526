// src/cerapan/cerapan.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CerapanController } from './cerapan.controller';
import { CerapanService } from './cerapan.service';
import { Cerapan, CerapanSchema } from './cerapan.schema';
import { PentadbirModule } from '../pentadbir/pentadbir.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cerapan.name, schema: CerapanSchema },
    ]),
    PentadbirModule,
  ],
  controllers: [CerapanController],
  providers: [CerapanService],
  exports: [CerapanService],
})
export class CerapanModule {}