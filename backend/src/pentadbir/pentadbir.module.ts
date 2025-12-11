import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PentadbirController } from './pentadbir.controller';
import { PentadbirService } from './pentadbir.service';
import { UsersModule } from '../users/users.module';
import { TemplateRubric, TemplateRubricSchema } from './template.schema';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: TemplateRubric.name, schema: TemplateRubricSchema },
    ]),
  ],
  controllers: [PentadbirController],
  providers: [PentadbirService],
  exports: [PentadbirService],
})
export class PentadbirModule {}
