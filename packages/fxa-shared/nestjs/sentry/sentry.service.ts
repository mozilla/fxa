/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Inject, Injectable } from '@nestjs/common';
import { ExtraErrorData } from '@sentry/integrations';
import * as Sentry from '@sentry/node';

import { filterSentryEvent } from './reporting';
import { SENTRY_CONFIG } from './sentry.constants';
import { SentryConfigParams } from './sentry.module';

@Injectable()
export class SentryService {
  constructor(@Inject(SENTRY_CONFIG) sentryConfig: SentryConfigParams) {
    // Setup Sentry
    Sentry.init({
      ...sentryConfig,
      integrations: [new ExtraErrorData()],
      beforeSend(event, hint) {
        return filterSentryEvent(event, hint);
      },
    });
  }
}
