/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReadableSpan } from '@opentelemetry/sdk-trace-base';

// Negative durations are unreasonable
const MIN_DURATION = 0;

// Duration over a day are unreasonable
const MAX_DURATION = 24 * 60 * 6e4;

/**
 * Checks, fixes, and flags bad duration state on spans.
 * @param span
 */
export function checkDuration(
  span: Pick<ReadableSpan, 'duration' | 'attributes'>
) {
  // Temporary Hack: There appears to be bug in the client side instrumentation code
  // that results in negative durations. These negative durations end up being
  // coerced into unsigned ints creating very odd and usually large values, which
  // obscures the entire trace's timing. To work around this, we will zero out these
  // durations and set an incorrect.duration flag.
  //
  // Note, that duration is of type HrTime. See Type definition to understand its
  // format.
  //
  if (span.duration[0] < MIN_DURATION || span.duration[0] > MAX_DURATION) {
    span.duration[0] = 0;
    span.duration[1] = 0;
    span.attributes['incorrect.duration'] = 'true';
  }
}
