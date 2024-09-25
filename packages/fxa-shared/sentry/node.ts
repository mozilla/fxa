/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/node';
import { ErrorEvent } from '@sentry/types';
import { SentryConfigOpts } from './models/SentryConfigOpts';
import { ILogger } from '../log';
import { tagCriticalEvent, tagFxaName } from './tag';
import { buildSentryConfig } from './config-builder';

export type ExtraOpts = {
  integrations?: any[];
  eventFilters?: Array<(event: ErrorEvent, hint: any) => ErrorEvent>;
};

export type InitSentryOpts = SentryConfigOpts & ExtraOpts;

export function initSentry(config: InitSentryOpts, log: ILogger) {
  if (!config?.sentry?.dsn) {
    log.error('No Sentry dsn provided. Cannot start sentry');
    return;
  }

  const opts = buildSentryConfig(config, log);
  const beforeSend = function (event: ErrorEvent, hint: any) {
    // Default
    event = tagCriticalEvent(event);
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
    log.debug('Issue initializing sentry!');
    log.error(e);
  }
}
