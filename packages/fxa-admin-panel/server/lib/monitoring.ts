/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Config from '../config';
import mozLog from 'mozlog';
import type { ILogger } from '@fxa/shared/log';
import { TracingOpts, initTracing } from '@fxa/shared/otel';
import { initSentry } from '@fxa/shared/sentry-node';
import { InitSentryOpts } from '@fxa/shared/sentry-utils';
import { version } from '../../package.json';

const properties = Config.getProperties();
const log: ILogger = mozLog(properties.logging)(properties.logging.app);

const config: InitSentryOpts & { tracing: TracingOpts } = {
  ...properties,
  release: version,
};

// Sentry also uses OTEL under the hood. Tracing must start first, and each side
// must know about the other, or traces and breadcrumbs bleed between requests.
if (config.sentry?.dsn) {
  config.tracing.sentry = { enabled: true };
}
if (initTracing(config.tracing, log) && config.sentry) {
  config.sentry.skipOpenTelemetrySetup = true;
}
initSentry(config, log);
