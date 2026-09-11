/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { InvalidMeteringEventError } from '../metering.error';
import { meteringWireEventSchema } from '../metering.schema';
import type { MeteringWireEvent } from '../metering.schema';

export function parseWireEvent(data: Buffer): MeteringWireEvent {
  const parsed = meteringWireEventSchema.safeParse(parseJson(data));
  if (!parsed.success) {
    throw new InvalidMeteringEventError(
      parsed.error.issues.map((issue) => issue.path.join('.'))
    );
  }
  return parsed.data;
}

function parseJson(data: Buffer): unknown {
  try {
    return JSON.parse(data.toString('utf8'));
  } catch {
    return null;
  }
}
