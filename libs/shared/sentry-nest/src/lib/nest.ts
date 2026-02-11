/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ErrorEvent } from '@sentry/core';
import * as Sentry from '@sentry/nestjs';
import {
  beforeSendServer,
  buildSentryConfig,
  InitSentryOpts,
  Logger,
} from '@fxa/shared/sentry-utils';

/**
 * There are multiple sentry implementations. For example, @sentry/node and @sentry/nestjs.
 * Depending on the application context.
 */
export function initSentry(config: InitSentryOpts, log: Logger) {
  if (!config?.sentry?.dsn) {
    log.error('No Sentry dsn provided. Cannot start sentry');
    return;
  }

  const opts = buildSentryConfig(config, log);

  const integrations = [
    Sentry.extraErrorDataIntegration({ depth: 5 }),

    // Custom Integrations
    ...(config.integrations || []),
  ];

  try {
    Sentry.init({
      // Defaults Options
      normalizeDepth: 6,
      maxValueLength: 500,

      // Custom Options
      integrations,
      beforeSend: (event: ErrorEvent, hint: any) => {
        return beforeSendServer(config, event, hint);
      },
      ...opts,
    });
  } catch (e) {
    log.debug('init-sentry', { msg: 'Issue initializing sentry!' });
    log.error('init-sentry', e);
  }
}
