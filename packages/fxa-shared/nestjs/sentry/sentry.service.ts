/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Inject, Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Span, SpanContext } from '@sentry/types';
import { MozLoggerService } from '../logger/logger.service';

@Injectable()
export class SentryService {
  constructor(private log: MozLoggerService) {}

  /**
   * Return the current span defined in the current Hub and Scope
   */
  public get span(): Span | undefined {
    this.log.debug('SentryService', { msg: `!!! get span` });
    return Sentry.getCurrentHub().getScope().getSpan();
  }

  public getRequestSpan(request: Request, spanContext: SpanContext) {
    this.log.debug('SentryService', {
      msg: `!!! get getRequestSpan`,
      request,
      spanContext,
    });

    if (!request) {
      this.log.debug('SentryService', {
        msg: `no request!`,
      });
      return;
    }

    const { method, headers, url } = request;

    const transaction = Sentry.startTransaction({
      name: `Route: ${method} ${url}`,
      op: 'transaction',
    });

    Sentry.getCurrentHub().configureScope((scope) => {
      scope.setSpan(transaction);

      scope.setContext('http', {
        method,
        url,
        headers,
      });
    });

    const span = Sentry.getCurrentHub().getScope().getSpan();

    span?.startChild(spanContext);

    return span;
  }

  /**
   * This will simply start a new child span in the current span
   *
   * @param spanContext
   */
  startChild(spanContext: SpanContext) {
    this.log.debug('SentryService', { msg: `!!! get startChild` });

    return this.span?.startChild(spanContext);
  }
}
