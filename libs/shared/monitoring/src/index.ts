/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { initTracing } from '@fxa/shared/otel';
import { initSentry } from '@fxa/shared/sentry-node';
import { TracingOpts } from '@fxa/shared/otel';
import { ILogger } from '@fxa/shared/log';
import { InitSentryOpts } from '@fxa/shared/sentry-utils';

export type MonitoringConfig = {
  log?: ILogger;
  config: InitSentryOpts & { tracing?: TracingOpts };
};

let initialized = false;

/**
 * Initializes modules related to error monitoring, performance monitoring, and tracing.
 *
 * IMPORTANT: This function must be called as early as possible during server startup, before
 * any server framework (e.g. Hapi, Express) registers its own instrumentation. Calling it
 * after framework initialization may result in incomplete or broken tracing.
 *
 * Initialization is guarded so that calling this function more than once is a no-op (a
 * warning is emitted on subsequent calls).
 *
 * @param opts - Monitoring initialization options, including an optional logger and a config
 *   object that may contain both Sentry and tracing settings.
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

  // Important! Order matters here. If OTEL is configured, Sentry must be initialized after OTEL.
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
