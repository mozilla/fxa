/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  type RawBodyRequest,
} from '@nestjs/common';
import { StripeWebhookService } from './stripe-webhooks.service';

@Controller('webhooks')
export class StripeWebhooksController {
  constructor(private stripeWebhookService: StripeWebhookService) {}

  @Post('stripe')
  @HttpCode(200)
  async postStripe(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string
  ) {
    await this.stripeWebhookService.handleWebhookEvent(req.rawBody, signature);

    return 'ok';
  }
}
