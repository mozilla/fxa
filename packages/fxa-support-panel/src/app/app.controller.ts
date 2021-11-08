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
import { Account, Device, TotpToken } from 'fxa-shared/db/models/auth';

import { CurrentUser } from '../auth/auth-header.decorator';
import { AuthHeaderGuard } from '../auth/auth-header.guard';
import { RemoteLookupService } from '../remote-lookup/remote-lookup.service';
import { AccountQuery } from './account-query.dto';
import { SubscriptionResponse } from '../remote-lookup/remote-responses.dto';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';

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

    const [account, devices, signinLocations, totp] = await Promise.all([
      Account.findByUid(uid),
      Device.findByUid(uid),
      this.remote.signinLocations(uid),
      TotpToken.findByUid(uid),
    ]);
    const subscriptions = await this.remote.subscriptions(uid, account!.email);

    return {
      created: String(new Date(account!.createdAt)),
      devices: devices.map((d) => ({
        created: String(new Date(d.createdAt!)),
        name: d.name,
        type: d.type,
      })),
      email: account!.email,
      emailVerified: account!.emailVerified,
      locale: account!.locale,
      signinLocations,
      subscriptionStatus: Object.keys(subscriptions).some(
        (k) => subscriptions[k as keyof SubscriptionResponse].length > 0
      ),
      webSubscriptions: subscriptions[MozillaSubscriptionTypes.WEB],
      playSubscriptions: subscriptions[MozillaSubscriptionTypes.IAP_GOOGLE],
      twoFactorAuth: !!totp,
      uid,
    };
  }
}
