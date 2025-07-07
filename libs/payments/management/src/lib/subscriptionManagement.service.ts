/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger, type LoggerService } from '@nestjs/common';
import { SanitizeExceptions } from '@fxa/shared/error';

@Injectable()
export class SubscriptionManagementService {
  constructor(@Inject(Logger) private log: LoggerService) {}

  // TODO: Remove when developing this class, along with the associated tests.
  // This method is for testing purposes only
  @SanitizeExceptions()
  checkInitialization() {
    this.log.log('SubscriptionManagementService is initialized');
    return { initialized: true };
  }
}
