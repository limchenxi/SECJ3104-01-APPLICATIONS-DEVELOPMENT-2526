import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiUsage, AiUsageSchema } from './schemas/ai-usage.schema';
import { AiModuleSchema } from './schemas/ai-module.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiModule.name, schema: AiModuleSchema },
      { name: AiUsage.name, schema: AiUsageSchema },
    ]),
  ],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}
