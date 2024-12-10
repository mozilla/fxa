import { Provider } from '@nestjs/common';
import { IsNumber, IsOptional } from 'class-validator';

export class StripeMapperConfig {
  @IsOptional()
  @IsNumber()
  ttl?: number;
}

export const MockStripeMapperConfig = {
  ttl: 60,
} satisfies StripeMapperConfig;

export const MockStripeMapperConfigProvider = {
  provide: StripeMapperConfig,
  useValue: MockStripeMapperConfig,
} satisfies Provider<StripeMapperConfig>;
