/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { StatsD } from 'hot-shots';

/**
 * Creates a new StatsD client that uses localhost by default.
 *
 * This can be used if there is no statsd server available as the
 * client sends data via UDP and will not hang or error if there's
 * no server available.
 */
export function localStatsD(): StatsD {
  return new StatsD();
}
