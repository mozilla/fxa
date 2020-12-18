/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  Controller,
  Get,
  Query,
  Render,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import { CurrentUser } from '../auth/auth-header.decorator';
import { AuthHeaderGuard } from '../auth/auth-header.guard';
import { RemoteLookupService } from '../remote-lookup/remote-lookup.service';
import { AccountQuery } from './account-query.dto';

@Controller()
@UseGuards(AuthHeaderGuard)
export class AppController {
  constructor(
    private log: MozLoggerService,
    private remote: RemoteLookupService
  ) {}

  @Get()
  @UsePipes(new ValidationPipe())
  @Render('index')
  async root(@CurrentUser() user: string, @Query() query: AccountQuery) {
    const uid = query.uid;
    const requestTicket = query.requestTicket || 'ticket-unknown';

    // This is the user who is asking for the information:
    this.log.info('infoRequest', { authUser: user, requestTicket, uid });

    const [
      { createdAt, email, emailVerified, locale },
      devices,
      signinLocations,
      totpEnabled,
    ] = await Promise.all([
      this.remote.account(uid),
      this.remote.devices(uid),
      this.remote.signinLocations(uid),
      this.remote.totpEnabled(uid),
    ]);
    const subscriptions = await this.remote.subscriptions(uid, email);

    return {
      created: String(new Date(createdAt)),
      devices: devices.map((d) => ({
        created: String(new Date(d.createdAt)),
        name: d.name,
        type: d.type,
      })),
      email,
      emailVerified,
      locale,
      signinLocations,
      subscriptionStatus: subscriptions.length > 0,
      subscriptions,
      twoFactorAuth: totpEnabled,
      uid,
    };
  }
}
