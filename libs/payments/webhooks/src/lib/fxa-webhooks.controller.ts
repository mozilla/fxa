/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { FxaWebhookService } from './fxa-webhooks.service';

@Controller('webhooks')
export class FxaWebhooksController {
  constructor(private fxaWebhookService: FxaWebhookService) {}

  @Post('fxa')
  @HttpCode(200)
  async postFxaEvent(@Headers('authorization') authorization: string) {
    await this.fxaWebhookService.handleWebhookEvent(authorization);
    return { success: true };
  }
}
