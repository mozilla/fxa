import { Module } from '@nestjs/common';
import { MetricsFactory } from 'fxa-shared/nestjs/metrics.service';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService, MetricsFactory],
  exports: [DatabaseService],
})
export class DatabaseModule {}
