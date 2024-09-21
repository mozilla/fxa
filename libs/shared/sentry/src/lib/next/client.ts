/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { SentryConfigOpts } from '../models/SentryConfigOpts';
import { buildSentryConfig } from '../config-builder';
import { Logger } from '../sentry.types';
import { beforeSend } from '../utils/beforeSend.client';

/**
 * @@todo - To be worked on in FXA-10398
 */
const sentryEnabled = true;

export function initSentryForNextjsClient(
  config: SentryConfigOpts,
  log?: Logger
) {
  if (!log) {
    log = console;
  }

  if (!config?.sentry?.dsn) {
    log.error('No Sentry dsn provided');
    return;
  }

  // We want sentry to be disabled by default... This is because we only emit data
  // for users that 'have opted in'. A subsequent call to 'enable' is needed to ensure
  // that sentry events only flow under the proper circumstances.
  //disable();

  const opts = buildSentryConfig(config, log);
  try {
    Sentry.init({
      ...opts,
      integrations: [
        Sentry.browserTracingIntegration({
          enableInp: true,
        }),
      ],
      beforeSend: function (event: Sentry.ErrorEvent) {
        return beforeSend(sentryEnabled, opts, event);
      },
    });
  } catch (e) {
    log.error(e);
  }
}
