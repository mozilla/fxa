import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { LegacyStatsDProvider } from '@fxa/shared/metrics/statsd';

@Module({
  providers: [DatabaseService, MozLoggerService, LegacyStatsDProvider],
  exports: [DatabaseService],
})
export class DatabaseModule {}
