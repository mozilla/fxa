/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Inject, Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';
require('@sentry/tracing');
import { ExtraErrorData } from '@sentry/integrations';

import { buildSentryConfig, tagCriticalEvent, tagFxaName } from '../../sentry';
import { MozLoggerService } from '../logger/logger.service';
import { filterSentryEvent } from './reporting';
import { SENTRY_CONFIG } from './sentry.constants';
import { SentryConfigParams } from './sentry.module';

@Injectable()
export class SentryService {
  constructor(
    @Inject(SENTRY_CONFIG) sentryConfig: SentryConfigParams,
    @Inject(MozLoggerService) logger: MozLoggerService
  ) {
    const opts = buildSentryConfig(sentryConfig.sentryConfig, logger);

    // Setup Sentry
    Sentry.init({
      ...opts,

      // Defaults
      normalizeDepth: 6,
      integrations: [
        new ExtraErrorData({ depth: 5 }),
        new Sentry.Integrations.Http({ tracing: true }),
      ],

      beforeSend(event, hint) {
        event = tagCriticalEvent(event);
        event = tagFxaName(event, opts.serverName);
        event = filterSentryEvent(event, hint);
        return event;
      },
    });
  }
}
