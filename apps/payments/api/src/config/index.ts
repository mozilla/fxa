import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDefined, ValidateNested } from 'class-validator';

import { CurrencyConfig } from '@fxa/payments/currency';
import { MeteringConfig } from '@fxa/entitlements/metering';
import { AppleIapClientConfig, GoogleIapClientConfig } from '@fxa/payments/iap';
import { PaymentsGleanConfig } from '@fxa/payments/metrics';
import { PaypalClientConfig } from '@fxa/payments/paypal';
import { StripeConfig } from '@fxa/payments/stripe';
import { FreeAccessProgramConfig } from '@fxa/payments/api-server';
import { StrapiClientConfig } from '@fxa/shared/cms';
import { MySQLConfig } from '@fxa/shared/db/mysql/core';
import { FxaWebhookConfig, StripeEventConfig } from '@fxa/payments/webhooks';
import { StatsDConfig } from '@fxa/shared/metrics/statsd';
import { FirestoreConfig } from '@fxa/shared/db/firestore';
import { FxaOAuthConfig } from '@fxa/payments/auth';
import { SentryConfig } from './sentry.config';

export class RootConfig {
  @Type(() => MySQLConfig)
  @ValidateNested()
  @IsDefined()
  public readonly mysqlConfig!: Partial<MySQLConfig>;

  @Type(() => PaymentsGleanConfig)
  @ValidateNested()
  @IsDefined()
  public readonly gleanConfig!: Partial<PaymentsGleanConfig>;

  @Type(() => StripeConfig)
  @ValidateNested()
  @IsDefined()
  public readonly stripeConfig!: Partial<StripeConfig>;

  @Type(() => PaypalClientConfig)
  @ValidateNested()
  @IsDefined()
  public readonly paypalClientConfig!: Partial<PaypalClientConfig>;

  @Type(() => CurrencyConfig)
  @ValidateNested()
  @IsDefined()
  public readonly currencyConfig!: Partial<CurrencyConfig>;

  @Type(() => FirestoreConfig)
  @ValidateNested()
  @IsDefined()
  public readonly firestoreConfig!: Partial<FirestoreConfig>;

  @Type(() => StatsDConfig)
  @ValidateNested()
  @IsDefined()
  public readonly statsDConfig!: Partial<StatsDConfig>;

  @Type(() => SentryConfig)
  @ValidateNested()
  @IsDefined()
  public readonly sentryConfig!: Partial<SentryConfig>;

  @Type(() => StrapiClientConfig)
  @ValidateNested()
  @IsDefined()
  public readonly strapiClientConfig!: Partial<StrapiClientConfig>;

  @Type(() => StripeEventConfig)
  @ValidateNested()
  @IsDefined()
  public readonly stripeEventsConfig!: Partial<StripeEventConfig>;

  @Type(() => FxaWebhookConfig)
  @ValidateNested()
  @IsDefined()
  public readonly fxaWebhookConfig!: Partial<FxaWebhookConfig>;

  @Type(() => FxaOAuthConfig)
  @ValidateNested()
  @IsDefined()
  public readonly fxaOAuthConfig!: Partial<FxaOAuthConfig>;

  @Type(() => AppleIapClientConfig)
  @ValidateNested()
  @IsDefined()
  public readonly appleIapClientConfig!: Partial<AppleIapClientConfig>;

  @Type(() => GoogleIapClientConfig)
  @ValidateNested()
  @IsDefined()
  public readonly googleIapClientConfig!: Partial<GoogleIapClientConfig>;

  @Type(() => MeteringConfig)
  @ValidateNested()
  @IsDefined()
  public readonly meteringConfig!: Partial<MeteringConfig>;

  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsDefined()
  public readonly swaggerUi!: boolean;

  @Type(() => FreeAccessProgramConfig)
  @ValidateNested()
  @IsDefined()
  public readonly freeAccessProgramConfig!: Partial<FreeAccessProgramConfig>;
}
