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

// IMPORTANT! This initialization function must be called first thing when a server starts. If it's called after server
// frameworks initialized instrumentation might not work properly.
/**
 * Initializes modules related to error monitoring, performance monitoring, and tracing.
 * @param opts - Initialization options. See underlying implementations for more details.
 */
export function initMonitoring(opts: MonitoringConfig) {
  const { log, config } = opts;
  if (initialized) {
    opts.log?.warn('monitoring', 'Monitoring can only be initialized once');
    return;
  }
  initialized = true;

  if (config.tracing) {
    initTracing(config.tracing, log || console);
  }
  if (config && config.sentry) {
    initSentry(config, log || console);
  }
}
