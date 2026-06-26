/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Event } from '@openmeter/sdk';

import { METERING_EVENT_SOURCE } from '../metering.constants';
import type { IngestEventArgs } from '../metering.manager';

export function toMeteringCloudEvent(args: IngestEventArgs): Event {
  return {
    id: args.id,
    source: METERING_EVENT_SOURCE,
    type: args.slug,
    subject: args.userIdentifier,
    time: args.timestamp ?? new Date(),
    data: { amount: args.amount },
  };
}
