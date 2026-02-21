/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { initTracing } from '../tracing/node-tracing';
import { InitSentryOpts, initSentry } from '../sentry/node';
import { TracingOpts } from '../tracing/config';
import { ILogger } from '../log';

export type MonitoringConfig = {
  log?: ILogger;
  config: InitSentryOpts & { tracing: TracingOpts };
};

let initialized = false;

/**
 *  IMPORTANT! This initialization function must be called first thing when a server starts. If it's called after server
 *  frameworks initialized instrumentation might not work properly.
 */

/**
 * Initializes modules related to error monitoring, performance monitoring, and tracing.
 * @param opts - Initialization options. See underlying implementations for more details.
 */
export function initMonitoring(opts: MonitoringConfig) {
  const { log: logger, config } = opts;
  const log = logger || console;

  if (initialized) {
    log.warn('monitoring', 'Monitoring can only be initialized once');
    return;
  }
  initialized = true;

  /**
   * IMPORTANT!
   *
   * Sentry also uses OTEL under the hood. Which means:
   *   - Mind the order of initialization. Otel should be first, if configured!
   *   - Mind the config.tracing.sentry.enabled flag
   *   - Mind the config.sentry.skipOpenTelemetrySetup flag
   *
   * If the order or flags aren't correct the following could happen:
   *   - Traces disappear
   *   - Sentry errors don't get recorded
   *   - Sentry context bleeds between requests (ie breadcrumbs, stack traces, etc. seem off)
   */

  let nodeTracingInitialized = false;
  if (config.tracing) {
    // Important! Sentry also uses OTEL under the hood. Flip this flag so the two can co-exist!
    // If you start seeing funny stack traces, or cross pollinating bread crumbs, something went
    // sideways here.
    if (config.sentry?.dsn) {
      config.tracing.sentry = { enabled: true };
    }

    log.info('monitoring', {
      msg: `Initialize Tracing with: ${JSON.stringify(config.tracing)}`,
    });
    nodeTracingInitialized = !!initTracing(config.tracing, log);
  }

  // Important! Order matters here. If otel is configured, this shoudl be done after OTEL initialization!
  if (config && config.sentry) {
    if (nodeTracingInitialized) {
      config.sentry.skipOpenTelemetrySetup = true;
    }

    log.info('monitoring', {
      msg: `Initializing Sentry: ${JSON.stringify({
        env: config.sentry?.env,
        clientName: config.sentry.clientName,
        serverName: config.sentry.serverName,
        hasDsn: !!config.sentry?.dsn,
      })}`,
    });
    initSentry(config, log);
  }
}
