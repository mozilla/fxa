/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';

import { GoogleClientConfig } from '@fxa/google';
import { MySQLConfig } from '@fxa/shared/db/mysql/core';
import { GeoDBConfig, GeoDBManagerConfig } from '@fxa/shared/geodb';
import { PaypalClientConfig } from 'libs/payments/paypal/src/lib/paypal.client.config';
import { StripeConfig } from '@fxa/payments/stripe';
import { StrapiClientConfig } from '@fxa/shared/cms';
import { FirestoreConfig } from 'libs/shared/db/firestore/src/lib/firestore.config';
import { StatsDConfig } from 'libs/shared/metrics/statsd/src/lib/statsd.config';
import { PaymentsGleanConfig } from '@fxa/payments/metrics';
import { CurrencyConfig } from 'libs/payments/currency/src/lib/currency.config';
import { ProfileClientConfig } from '@fxa/profile/client';
import { ContentServerClientConfig } from '@fxa/payments/content-server';
import { NotifierSnsConfig } from '@fxa/shared/notifier';

export class RootConfig {
  @Type(() => MySQLConfig)
  @ValidateNested()
  @IsDefined()
  public readonly mysqlConfig!: Partial<MySQLConfig>;

  @Type(() => GeoDBConfig)
  @ValidateNested()
  @IsDefined()
  public readonly geodbConfig!: Partial<GeoDBConfig>;

  @Type(() => GeoDBManagerConfig)
  @ValidateNested()
  public readonly geodbManagerConfig!: Partial<GeoDBManagerConfig>;

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

  @Type(() => StrapiClientConfig)
  @ValidateNested()
  @IsDefined()
  public readonly strapiClientConfig!: Partial<StrapiClientConfig>;

  @Type(() => FirestoreConfig)
  @ValidateNested()
  @IsDefined()
  public readonly firestoreConfig!: Partial<FirestoreConfig>;

  @Type(() => StatsDConfig)
  @ValidateNested()
  @IsDefined()
  public readonly statsDConfig!: Partial<StatsDConfig>;

  @Type(() => PaymentsGleanConfig)
  @ValidateNested()
  @IsDefined()
  public readonly gleanConfig!: Partial<PaymentsGleanConfig>;

  @Type(() => ProfileClientConfig)
  @ValidateNested()
  @IsDefined()
  public readonly profileClientConfig!: Partial<ProfileClientConfig>;

  @Type(() => NotifierSnsConfig)
  @ValidateNested()
  @IsDefined()
  public readonly notifierSnsConfig!: Partial<NotifierSnsConfig>;

  @Type(() => ContentServerClientConfig)
  @ValidateNested()
  @IsDefined()
  public readonly contentServerClientConfig!: Partial<ContentServerClientConfig>;

  @Type(() => GoogleClientConfig)
  @ValidateNested()
  @IsDefined()
  public readonly googleClientConfig!: Partial<GoogleClientConfig>;
}
