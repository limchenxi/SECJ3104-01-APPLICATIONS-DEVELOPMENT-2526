import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
