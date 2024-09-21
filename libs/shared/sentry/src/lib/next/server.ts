/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/nextjs';
import { ErrorEvent } from '@sentry/types';
import { SentryConfigOpts } from '../models/SentryConfigOpts';
import { buildSentryConfig } from '../config-builder';
import { Logger } from '../sentry.types';
import { tagFxaName } from '../utils/tagFxaName';

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
  /**
   * @@todo - Move to lib/utils/beforeSend.server.ts - FXA-10402
   */
  const beforeSend = function (event: ErrorEvent, hint: any) {
    // Default
    event = tagFxaName(event, config.sentry?.serverName || 'unknown');

    // Custom filters
    config.eventFilters?.forEach((filter) => {
      event = filter(event, hint);
    });
    return event;
  };

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
      beforeSend,
      ...opts,
    });
  } catch (e) {
    log.debug('init-sentry', { msg: 'Issue initializing sentry!' });
    log.error('init-sentry', e);
  }
}
