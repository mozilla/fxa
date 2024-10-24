/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/nextjs';
import { ErrorEvent, EventHint } from '@sentry/types';
import {
  Logger,
  SentryConfigOpts,
  buildSentryConfig,
  beforeSendServer,
} from '@fxa/shared/sentry-utils';

type ExtraOpts = {
  integrations?: any[];
  eventFilters?: Array<(event: ErrorEvent, hint: any) => ErrorEvent>;
};

type InitSentryOpts = SentryConfigOpts & ExtraOpts;

export function initSentryForNextjsServer(config: InitSentryOpts, log: Logger) {
  if (!config?.sentry?.dsn) {
    log.error('No Sentry dsn provided. Cannot start sentry');
    return;
  }

  const opts = buildSentryConfig(config, log);
  const integrations = [
    // Default
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
      beforeSend: function (event: ErrorEvent, hint: EventHint) {
        return beforeSendServer(config, event, hint);
      },
      ...opts,
    });
  } catch (e) {
    log.debug('init-sentry', { msg: 'Issue initializing sentry!' });
    log.error('init-sentry', e);
  }
}
