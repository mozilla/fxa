/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ErrorEvent, Event } from '@sentry/types';

import { SQS } from 'aws-sdk';

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
 * Defacto Sentry Event Filter. Can be extended and customized as needed.
 */
export class SentryPiiFilter extends FilterBase {
  /**
   * Creates a new PII Filter for sentry data
   * @param actions - Set of filters to apply
   */
  constructor(actions: IFilterAction[]) {
    super(actions);
  }

  /**
   * Filter PII from all known sentry fields
   */
  public filter(event: ErrorEvent) {
    // Target key parts of sentry event structure
    this.scrubMessage(event)
      .scrubContext(event)
      .scrubBreadCrumbs(event)
      .scrubRequest(event)
      .scrubTags(event)
      .scrubException(event)
      .scrubExtra(event)
      .scrubUser(event);
    return event;
  }

  protected scrubMessage(event: Event) {
    if (event.message) {
      event.message = this.applyFilters(event.message);
    }
    return this;
  }

  protected scrubBreadCrumbs(event: Event) {
    for (const bc of event.breadcrumbs || []) {
      if (bc.message) {
        bc.message = this.applyFilters(bc.message);
      }
      if (bc.data) {
        bc.data = this.applyFilters(bc.data);
      }
    }
    return this;
  }

  protected scrubRequest(event: Event) {
    if (event.request?.headers) {
      event.request.headers = this.applyFilters(event.request.headers);
    }

    if (event.request?.data) {
      event.request.data = this.applyFilters(event.request.data);
    }

    if (event.request?.query_string) {
      event.request.query_string = this.applyFilters(
        event.request.query_string
      );
    }

    if (event.request?.env) {
      event.request.env = this.applyFilters(event.request.env);
    }

    if (event.request?.url) {
      event.request.url = this.applyFilters(event.request.url);
    }

    if (event.request?.cookies) {
      event.request.cookies = this.applyFilters(event.request.cookies);
    }

    return this;
  }

  protected scrubTags(event: Event) {
    if (typeof event.tags?.['url'] === 'string') {
      event.tags['url'] = this.applyFilters(event.tags['url']);
    }
    return this;
  }

  protected scrubException(event: Event) {
    if (event.exception) {
      event.exception = this.applyFilters(event.exception);
    }
    return this;
  }

  protected scrubExtra(event: Event) {
    if (event.extra) {
      event.extra = this.applyFilters(event.extra);
    }
    return this;
  }

  protected scrubUser(event: Event) {
    if (event.user) {
      event.user = this.applyFilters(event.user);
    }
    return this;
  }

  protected scrubContext(event: Event) {
    if (event.contexts) {
      event.contexts = this.applyFilters(event.contexts);
    }
    return this;
  }
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
  public filter(event: SQS.Message) {
    this.filterBody(event);
    return event;
  }

  protected filterBody(event: SQS.Message) {
    event.Body = this.applyFilters(event.Body);
    return this;
  }
}
