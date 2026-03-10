/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/nextjs';
import { ErrorEvent } from '@sentry/core';
import { InitSentryOpts } from '@fxa/shared/sentry-utils';
import { buildSentryConfig } from '../config-builder';
import { Logger } from '../sentry.types';
import { beforeSend } from '../utils/beforeSend.server';

export function initSentryForNextjsServer(config: InitSentryOpts, log: Logger) {
  if (!config?.sentry?.dsn) {
    log.error('No Sentry dsn provided. Cannot start sentry');
    return;
  }

  const opts = buildSentryConfig(config, log);

  const integrations = [
    // Default
    Sentry.extraErrorDataIntegration({ depth: 5 }),
    Sentry.requestDataIntegration(),

    // Custom Integrations
    ...(config.integrations || []),
  ];

  const beforeEventSend = (event: ErrorEvent, hint: any) => {
    return beforeSend(event, hint, config);
  };

  try {
    Sentry.init({
      // Defaults Options
      normalizeDepth: 6,
      maxValueLength: 500,

      // Custom Options
      integrations,
      beforeSend: beforeEventSend,
      ...opts,
    });
  } catch (e) {
    log.debug('init-sentry', { msg: 'Issue initializing sentry!' });
    log.error('init-sentry', e);
  }
}
