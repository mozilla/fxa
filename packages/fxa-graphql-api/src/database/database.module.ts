import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { StatsDFactory } from '@fxa/shared/metrics/statsd';

@Module({
  providers: [DatabaseService, MozLoggerService, StatsDFactory],
  exports: [DatabaseService],
})
export class DatabaseModule {}
