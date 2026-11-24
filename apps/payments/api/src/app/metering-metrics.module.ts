/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger, Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';

import { MeteringStrapiCacheClientProvider } from '@fxa/entitlements/metering';
import { MeteringConfigurationManager, StrapiClient } from '@fxa/shared/cms';
import { FirestoreProvider } from '@fxa/shared/db/firestore';
import { StatsDProvider } from '@fxa/shared/metrics/statsd';

import { RootConfigModule } from '../config/config.module';
import { MeteringMetricsProviders } from './metering-metrics.providers';

@Module({
  imports: [SentryModule.forRoot(), RootConfigModule],
  providers: [
    Logger,
    StatsDProvider,
    FirestoreProvider,
    StrapiClient,
    MeteringStrapiCacheClientProvider,
    MeteringConfigurationManager,
    ...MeteringMetricsProviders,
  ],
})
export class MeteringMetricsModule {}
