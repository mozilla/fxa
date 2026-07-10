/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Controller, Get, UseGuards } from '@nestjs/common';

import {
  CurrentUser,
  FxaOAuthAuthGuard,
  type FxaOAuthUser,
} from '@fxa/payments/auth';

import type { BillingAndSubscriptionsResponse } from './billing-and-subscriptions.schema';
import { BillingAndSubscriptionsService } from './billing-and-subscriptions.service';

@Controller('v1/billing-and-subscriptions')
@UseGuards(FxaOAuthAuthGuard)
export class BillingAndSubscriptionsController {
  constructor(private readonly service: BillingAndSubscriptionsService) {}

  @Get()
  getBillingAndSubscriptions(
    @CurrentUser() user: FxaOAuthUser
  ): Promise<BillingAndSubscriptionsResponse> {
    return this.service.get({ uid: user.sub, clientId: user.client_id });
  }
}
