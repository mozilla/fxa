/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';

import { MySQLConfig } from '@fxa/shared/db/mysql/core';
import { GeoDBConfig, GeoDBManagerConfig } from '@fxa/shared/geodb';
import { PaypalClientConfig } from 'libs/payments/paypal/src/lib/paypal.client.config';
import { StripeConfig } from '@fxa/payments/stripe';
import { ContentfulClientConfig } from '@fxa/shared/contentful';
import { FirestoreConfig } from 'libs/shared/db/firestore/src/lib/firestore.config';
import { StatsDConfig } from 'libs/shared/metrics/statsd/src/lib/statsd.config';
import { ContentfulServiceConfig } from 'libs/shared/contentful/src/lib/contentful.service.config';

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

  @Type(() => ContentfulClientConfig)
  @ValidateNested()
  @IsDefined()
  public readonly contentfulClientConfig!: Partial<ContentfulClientConfig>;

  @Type(() => ContentfulServiceConfig)
  @ValidateNested()
  @IsDefined()
  public readonly contentfulServiceConfig!: Partial<ContentfulServiceConfig>;

  @Type(() => FirestoreConfig)
  @ValidateNested()
  @IsDefined()
  public readonly firestoreConfig!: Partial<FirestoreConfig>;

  @Type(() => StatsDConfig)
  @ValidateNested()
  @IsDefined()
  public readonly statsDConfig!: Partial<StatsDConfig>;
}
