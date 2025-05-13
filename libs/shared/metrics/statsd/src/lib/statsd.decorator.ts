/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { StatsD } from '..';

class TargetExposesStatsD {
  statsd!: StatsD;
}

/**
 * Will capture timing for this method and send them to StatsD. Requires the target class to have statsd exposed as a public property.
 * Timings will appear as ClassName_methodName in StatsD.
 */
export function CaptureTimingWithStatsD<
  T extends TargetExposesStatsD
>(options?: {
  tags?: Record<string, string>;
  handle?: (this: T, elapsed: number) => void;
}) {
  return function (_target: T, key: string, descriptor: PropertyDescriptor) {
    const originalDef = descriptor.value;

    descriptor.value = function (this: T, ...args: any[]) {
      const defaultHandler = function (this: T, elapsed: number) {
        this.statsd.timing(`${this.constructor.name}_${key}`, elapsed, {
          sourceClass: this.constructor.name,
          ...options?.tags,
        });
        this.statsd.timing(this.constructor.name, elapsed, {
          methodName: key,
          ...options?.tags,
        });
      };
      const handler = options?.handle || defaultHandler;

      const start = performance.now();
      const originalReturnValue = originalDef.apply(this, args);

      if (originalReturnValue instanceof Promise) {
        return originalReturnValue
          .then((value) => {
            const end = performance.now();
            handler.apply(this, [end - start]);

            return value;
          })
          .catch((err) => {
            const end = performance.now();
            handler.apply(this, [end - start]);

            throw err;
          });
      }

      const end = performance.now();
      handler.apply(this, [end - start]);

      return originalReturnValue;
    };
    return descriptor;
  };
}
