/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { performance } from 'perf_hooks';
import { StatsD } from 'hot-shots';

export const emitStatsdMetrics =
  <T extends (...args) => ReturnType<T>>(
    fn: T,
    name: string,
    metricsEmitter: StatsD
  ) =>
  async (...args: Parameters<T>) => {
    const startTime = performance.now();
    const result = await fn(...args);
    metricsEmitter.timing(`${name}.latency`, performance.now() - startTime);
    metricsEmitter.increment(`${name}.count`);
    return result;
  };
