import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';

import { CurrencyConfig } from '@fxa/payments/currency';
import { PaymentsGleanConfig } from '@fxa/payments/metrics';
import { PaypalClientConfig } from '@fxa/payments/paypal';
import { StripeConfig } from '@fxa/payments/stripe';
import { StrapiClientConfig } from '@fxa/shared/cms';
import { MySQLConfig } from '@fxa/shared/db/mysql/core';
import { StripeEventConfig } from '@fxa/payments/webhooks';
import { StatsDConfig } from '@fxa/shared/metrics/statsd';
import { FirestoreConfig } from 'libs/shared/db/firestore/src/lib/firestore.config';

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

  @Type(() => StrapiClientConfig)
  @ValidateNested()
  @IsDefined()
  public readonly strapiClientConfig!: Partial<StrapiClientConfig>;

  @Type(() => StripeEventConfig)
  @ValidateNested()
  @IsDefined()
  public readonly stripeEventsConfig!: Partial<StripeEventConfig>;
}
