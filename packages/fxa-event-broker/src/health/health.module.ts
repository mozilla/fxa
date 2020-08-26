import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  imports: [HealthController],
  controllers: [HealthController],
})
export class HealthModule {}
