/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Message } from '@aws-sdk/client-sqs';

import { IFilterAction, PiiData } from '../models/pii';
import { Logger } from '../sentry.types';

/**
 * Base class for all filters
 */
export abstract class FilterBase {
  constructor(
    protected readonly actions: IFilterAction[],
    protected readonly logger?: Logger
  ) {}

  /**
   * Applies filters to object and drills down into object
   * @param val - Value to drill into
   * @param depth - the current depth in the object
   * @param maxDepth - depth at which to give up
   * @returns
   */
  applyFilters<T extends PiiData>(val: T, depth = 1, maxDepth = 10): T {
    if (depth < maxDepth) {
      for (const x of this.actions) {
        try {
          const result = x.execute(val, depth);
          val = result.val;

          // Exit pipeline early if value is not longer actionable.
          if (result.exitPipeline) {
            break;
          }
        } catch (err) {
          this.logger?.error('sentry.filter.error', { err });
        }
      }

      if (val != null && typeof val === 'object') {
        Object.values(val).forEach((x) => {
          this.applyFilters(x, depth + 1, maxDepth);
        });
      }
    }

    return val;
  }

  abstract filter(data: PiiData): PiiData;
}

/**
 * Scrubs PII from SQS Messages
 */
export class SqsMessageFilter extends FilterBase {
  /**
   * Create a new SqsMessageFilter
   * @param actions
   */
  constructor(actions: IFilterAction[]) {
    super(actions);
  }

  /**
   * Filter Body of sqs messages
   */
  public filter(event: Message) {
    this.filterBody(event);
    return event;
  }

  protected filterBody(event: Message) {
    event.Body = this.applyFilters(event.Body);
    return this;
  }
}
