/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  CurrentUser,
  FxaOAuthAuthGuard,
  type FxaOAuthUser,
} from '@fxa/payments/auth';

import {
  billingAndSubscriptionsResponseSchema,
  type BillingAndSubscriptionsResponse,
} from './billing-and-subscriptions.schema';
import { BillingAndSubscriptionsService } from './billing-and-subscriptions.service';
import { ValidateResponse, zodToOpenApi } from './util/openapi';

@ApiTags('Billing & Subscriptions')
@ApiBearerAuth()
@Controller('v1/billing-and-subscriptions')
@UseGuards(FxaOAuthAuthGuard)
export class BillingAndSubscriptionsController {
  constructor(private readonly service: BillingAndSubscriptionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get billing info and subscriptions for the authenticated user',
    description:
      'Returns the payment method on file (card or PayPal) and all active subscriptions ' +
      '(Stripe web, Google Play IAP, Apple App Store IAP) for the authenticated user. ' +
      'Requires a valid FxA OAuth access token with appropriate scopes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Billing details and active subscriptions',
    schema: zodToOpenApi(billingAndSubscriptionsResponseSchema),
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized — missing, expired, or invalid OAuth access token',
  })
  @ValidateResponse(billingAndSubscriptionsResponseSchema)
  getBillingAndSubscriptions(
    @CurrentUser() user: FxaOAuthUser
  ): Promise<BillingAndSubscriptionsResponse> {
    return this.service.get({ uid: user.sub, clientId: user.client_id });
  }
}
