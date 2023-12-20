/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Inject, Injectable } from '@nestjs/common';

import { MozLoggerService } from '../logger/logger.service';
import { SENTRY_CONFIG } from './sentry.constants';
import { SentryConfigParams } from './sentry.module';

@Injectable()
export class SentryService {
  constructor(
    @Inject(SENTRY_CONFIG) sentryConfig: SentryConfigParams,
    @Inject(MozLoggerService) logger: MozLoggerService
  ) {
    // TBD... Maybe this is still useful for something like wrapping common Sentry operations?
    // Note, that due potential race conditions, sentry is no initialized in this service. Rather
    // it is initialized when the app starts up.
  }
}
