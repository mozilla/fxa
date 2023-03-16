import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { MetricsFactory } from 'fxa-shared/nestjs/metrics.service';

@Module({
  providers: [DatabaseService, MetricsFactory],
  exports: [DatabaseService],
})
export class DatabaseModule {}
