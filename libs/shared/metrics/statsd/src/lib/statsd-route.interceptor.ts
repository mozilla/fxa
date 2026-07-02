/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StatsD } from 'hot-shots';
import { Observable, finalize, tap } from 'rxjs';

import { StatsDService } from './statsd.provider';

export const SKIP_ROUTE_METRICS_KEY = 'statsdRouteMetrics:skip';

/**
 * Marks a controller or handler as excluded from `StatsDRouteInterceptor`.
 * Applied at the class level, every handler on that controller is skipped;
 * applied at the method level, only that handler is skipped. Intended for
 * load-balancer probes and version endpoints whose traffic would drown out
 * real signal in dashboards.
 */
export const SkipRouteMetrics = () => SetMetadata(SKIP_ROUTE_METRICS_KEY, true);

/**
 * Global NestJS interceptor that emits StatsD metrics for every HTTP route:
 * - `route.request.count`     : counter, incremented once per request
 * - `route.request.duration`  : timing (ms) from interceptor entry to response
 *
 * Both metrics are tagged with `controller`, `handler`, `method`, and
 * `statusCode` so downstream dashboards can slice by route or outcome
 * without exploding cardinality (the tag values are all bounded).
 *
 * Non-HTTP execution contexts (RPC, GraphQL, etc.) are passed through
 * without metrics because `route.*` semantics do not apply.
 */
@Injectable()
export class StatsDRouteInterceptor implements NestInterceptor {
  constructor(
    @Inject(StatsDService) private readonly statsd: StatsD,
    private readonly reflector: Reflector
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_ROUTE_METRICS_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (skip) {
      return next.handle();
    }

    const start = performance.now();
    const http = context.switchToHttp();
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const method: string = http.getRequest()?.method ?? 'UNKNOWN';

    const emit = (statusCode: number) => {
      const elapsed = performance.now() - start;
      const tags = {
        controller,
        handler,
        method,
        statusCode: String(statusCode),
      };
      this.statsd.increment('route.request.count', tags);
      this.statsd.timing('route.request.duration', elapsed, tags);
    };

    // `tap({error})` captures the exception into `caughtError` and lets it
    // propagate; `finalize` then fires on complete, error, and unsubscribe
    // (e.g., client disconnect), so exactly one metric is recorded per
    // request regardless of how the stream terminates.
    let caughtError: unknown;

    return next.handle().pipe(
      tap({
        error: (err: unknown) => {
          caughtError = err;
        },
      }),
      finalize(() => {
        const statusCode =
          caughtError instanceof HttpException
            ? caughtError.getStatus()
            : caughtError !== undefined
              ? 500
              : (http.getResponse()?.statusCode ?? 200);
        emit(statusCode);
      })
    );
  }
}
