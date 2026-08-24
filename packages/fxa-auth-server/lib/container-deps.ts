/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Container lookups for modules that have no injected collaborators — bare
// object exports and module-load singletons. Both return undefined when the
// token is unregistered, which is the case in most unit tests, so callers must
// treat the result as optional.

import { StatsD } from 'hot-shots';
import { Container } from 'typedi';

import { AuthLogger } from './types';

export function resolveAuthLogger(): AuthLogger | undefined {
  return Container.has(AuthLogger) ? Container.get(AuthLogger) : undefined;
}

export function resolveStatsD(): StatsD | undefined {
  return Container.has(StatsD) ? Container.get(StatsD) : undefined;
}
