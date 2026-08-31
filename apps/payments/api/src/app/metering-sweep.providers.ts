/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Provider } from '@nestjs/common';

import {
  ClickHouseClient,
  MeteringSweepManager,
  MeteringSweepRepository,
  MeteringSweepService,
  MeteringWebhookManager,
  UsageGrantsManager,
} from '@fxa/entitlements/metering';

export const MeteringSweepProviders: Provider[] = [
  ClickHouseClient,
  MeteringSweepRepository,
  MeteringSweepManager,
  MeteringWebhookManager,
  UsageGrantsManager,
  MeteringSweepService,
];
