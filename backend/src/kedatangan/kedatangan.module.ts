import { Module } from '@nestjs/common';
import { KedatanganService } from './kedatangan.service';
import { KedatanganController } from './kedatangan.controller';

@Module({
  providers: [KedatanganService],
  controllers: [KedatanganController]
})
export class KedatanganModule {}
