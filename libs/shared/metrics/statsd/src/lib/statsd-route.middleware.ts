/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Inject,
  Injectable,
  Logger,
  type LoggerService,
  NestMiddleware,
  Optional,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { StatsD } from 'hot-shots';

import { StatsDService } from './statsd.provider';

/**
 * Cap for a client-controlled field interpolated into a log line. Bounds
 * per-line log volume from scanners hitting long/garbage URLs; 256 comfortably
 * covers any real route path.
 */
const MAX_LOG_FIELD_LENGTH = 256;

/**
 * Express middleware that emits StatsD metrics for every HTTP response:
 * - `route.request.count`    : counter, incremented once per request
 * - `route.request.duration` : timing (ms) from middleware entry to
 *                              `res.on('finish')` (response fully flushed)
 *
 * Both metrics are tagged with `method`, `route`, and `statusCode`.
 * `route` is `req.route.path` (the Express route pattern, e.g.
 * `/subscriptions/:id`) when a handler matched, or `'unmatched'` for
 * 404s and requests rejected before routing.
 *
 * Runs at the Express layer, before Nest's guard/interceptor pipeline,
 * so it captures auth failures (401/403), pipe validation errors,
 * handler exceptions, and successful responses in a single path.
 *
 * When no route matched (`req.route` is undefined — a genuine 404, distinct
 * from a matched handler that threw NotFoundException), it also logs one debug
 * line with the requested method + path, to help spot clients hitting the
 * wrong URL. Logging is opt-in: it only fires if a Logger is provided.
 */
@Injectable()
export class StatsDRouteMiddleware implements NestMiddleware {
  constructor(
    @Inject(StatsDService) private readonly statsd: StatsD,
    @Optional() @Inject(Logger) private readonly logger?: LoggerService
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = performance.now();

    res.on('finish', () => {
      const elapsed = performance.now() - start;
      const route = normalizeRoute(req.route?.path);
      const tags = {
        method: req.method,
        route,
        statusCode: String(res.statusCode),
      };
      this.statsd.increment('route.request.count', tags);
      this.statsd.timing('route.request.duration', elapsed, tags);

      if (route === 'unmatched') {
        // req.path is client-controlled: strip CR/LF (log forging) and cap
        // length. req.path (not originalUrl) also avoids logging any query
        // string.
        const safePath = req.path
          .replace(/[\r\n]/g, '')
          .slice(0, MAX_LOG_FIELD_LENGTH);
        this.logger?.debug?.(
          `unmatched route: ${req.method} ${safePath} → ${res.statusCode}`,
          StatsDRouteMiddleware.name
        );
      }
    });

    next();
  }
}

/**
 * Strips the leading `/` from an Express route pattern so downstream
 * statsd receivers (Graphite/Prometheus/etc.) that sanitize `/` don't
 * produce tag values like `-v1-billing-and-subscriptions`. Falls back
 * to `unmatched` when no route was resolved (e.g., 404).
 */
export const normalizeRoute = (path: string | undefined): string => {
  if (!path) return 'unmatched';
  return path.replace(/^\//, '') || 'root';
};
