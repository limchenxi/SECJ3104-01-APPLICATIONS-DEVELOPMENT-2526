import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';

import { AiModule } from './schemas/ai-module.schema';
import { AiUsage } from './schemas/ai-usage.schema';

import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(
    @InjectModel(AiModule.name)
    private moduleModel: Model<AiModule>,

    @InjectModel(AiUsage.name)
    private usageModel: Model<AiUsage>,

    private readonly aiService: AiService,
  ) {}

  // ────────────────────────────────────────────────
  //  AI MODULES
  // ────────────────────────────────────────────────

  @Get('modules')
  async getModules() {
    return this.moduleModel.find();
  }

  @Post('modules')
  async createModule(@Body() dto: any) {
    console.log('Received DTO:', dto);
    return this.moduleModel.create(dto);
  }

  @Get('modules/:id')
  async getModuleById(@Param('id') id: string) {
    return this.moduleModel.findById(id);
  }

  @Put('modules/:id')
  async updateModule(@Param('id') id: string, @Body() body: any) {
    return this.moduleModel.findByIdAndUpdate(
      id,
      body as UpdateQuery<AiModule>,
      { new: true },
    );
  }

  @Delete('modules/:id')
  async deleteModule(@Param('id') id: string) {
    return this.moduleModel.findByIdAndDelete(id);
  }

  // ────────────────────────────────────────────────
  //  USAGE ANALYTICS
  // ────────────────────────────────────────────────

  @Get('usage')
  async getUsage() {
    return this.usageModel.find().sort({ createdAt: -1 });
  }

  @Get('usage/stats/module')
  async getUsageByModule() {
    return this.usageModel.aggregate([
      { $group: { _id: '$module', count: { $sum: 1 } } },
    ]);
  }

  @Get('usage/stats/user')
  async getUsageByUser() {
    return this.usageModel.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
  }

  // ────────────────────────────────────────────────
  //  AI EXECUTION
  // ────────────────────────────────────────────────
  //   @Post('run')
  //   async runAi(
  //     @Body() dto: { module: string; prompt: string; userId?: string },
  //   ) {
  //     // 1. Validate
  //     if (!dto.module || !dto.prompt) {
  //       return { message: 'Missing module or prompt' };
  //     }

  //     // 2. Find Module
  //     const aiModule = await this.moduleModel.findOne({
  //       usageType: dto.module,
  //       enabled: true,
  //     });

  //     if (!aiModule) {
  //       return { message: `AI module '${dto.module}' not found or disabled` };
  //     }

  //     // 3. Record Usage
  //     await this.usageModel.create({
  //       userId: dto.userId ?? 'Unknown',
  //       module: aiModule.usageTypes,
  //       provider: aiModule.provider,
  //       model: aiModule.model,
  //     });

  //     // 4. Execute AI
  //     try {
  //       const result = await this.aiService.callAI(aiModule, dto.prompt);

  //       return {
  //         success: true,
  //         module: aiModule,
  //         result,
  //       };
  //     } catch (err) {
  //       return {
  //         success: false,
  //         message: 'AI execution failed',
  //         error: err instanceof Error ? err.message : String(err),
  //       };
  //     }
  //   }
}
