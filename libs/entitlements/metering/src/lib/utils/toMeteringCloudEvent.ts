/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { METERING_EVENT_SOURCE } from '../metering.constants';

export interface IngestEventArgs {
  id: string;
  userIdentifier: string;
  slug: string;
  amount: number;
  timestamp?: Date;
}

export interface MeteringCloudEvent {
  id: string;
  source: string;
  type: string;
  subject: string;
  time: Date;
  data: { amount: number };
}

export function toMeteringCloudEvent(
  args: IngestEventArgs
): MeteringCloudEvent {
  return {
    id: args.id,
    source: METERING_EVENT_SOURCE,
    type: args.slug,
    subject: args.userIdentifier,
    time: args.timestamp ?? new Date(),
    data: { amount: args.amount },
  };
}
