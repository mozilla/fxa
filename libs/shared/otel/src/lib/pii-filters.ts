/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ILogger } from '@fxa/shared/log';
import {
  PiiData,
  CommonPiiActions,
  FilterBase,
} from '@fxa/shared/sentry-utils';

/** Matches attribute names that need to be filtered. */
const reTargetPiiAttributes = /^(db|http)\./;

/**
 * PiiFilter specifically for scrubbing open telemetry traces.
 */
export class TracingPiiFilter extends FilterBase {
  /**
   * Creates new PII Filter for tracing
   * @param logger - optional logger
   */
  constructor(logger?: ILogger) {
    super(
      [
        CommonPiiActions.breadthFilter,
        CommonPiiActions.depthFilter,
        CommonPiiActions.piiKeys,
        CommonPiiActions.emailValues,
        CommonPiiActions.tokenValues,
        CommonPiiActions.ipV4Values,
        CommonPiiActions.ipV6Values,
        CommonPiiActions.urlUsernamePassword,
      ],
      logger
    );
  }

  /**
   * Filter traces.
   * @param data - Data to filter.
   */
  filter(data: PiiData): PiiData {
    try {
      if (typeof data === 'object' && data?.['attributes']) {
        for (const key of Object.keys(data['attributes'])) {
          if (reTargetPiiAttributes.test(key)) {
            data['attributes'][key] = this.applyFilters(
              data['attributes'][key]
            );
          }
        }
      }
    } catch (err) {
      // Note, we have to throw the error, since the trace could contain PII if
      // the routine doesn't exist cleanly. We will log this, so there's some way
      // to track the problem down if we notice missing spans.
      this.logger?.error('pii-trace-filter', err);
      throw err;
    }

    return data;
  }
}

/** Singleton */
let piiFilter: TracingPiiFilter;

/** Creates a PII filter for tracing. This behaves as a singleton. */
export function createPiiFilter(enabled: boolean, logger?: ILogger) {
  if (!enabled) {
    return;
  }

  if (!piiFilter) {
    piiFilter = new TracingPiiFilter(logger);
  }

  return piiFilter;
}
