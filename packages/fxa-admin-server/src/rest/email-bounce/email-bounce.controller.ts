/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MozLoggerService } from '@fxa/shared/mozlog';

import { AdminPanelFeature } from '@fxa/shared/guards';
import { CurrentUser } from '../../auth/auth-header.decorator';
import { AuthHeaderGuard } from '../../auth/auth-header.guard';
import { Features } from '../../auth/user-group-header.decorator';
import { DatabaseService } from '../../database/database.service';
import {
  EventLoggingService,
  EventNames,
} from '../../event-logging/event-logging.service';

@UseGuards(AuthHeaderGuard)
@Controller('/api/email-bounce')
export class EmailBounceController {
  constructor(
    private log: MozLoggerService,
    private db: DatabaseService,
    private eventLogging: EventLoggingService
  ) {}

  @Features(AdminPanelFeature.ClearEmailBounces)
  @Post('clear')
  public async clearEmailBounce(
    @Body('email') email: string,
    @CurrentUser() user: string
  ) {
    this.eventLogging.onEvent(EventNames.ClearBounces);
    const result = await this.db.emailBounces
      .query()
      .delete()
      .where('email', email);
    this.log.info('clearEmailBounce', { user, email, success: result });
    return !!result;
  }
}
