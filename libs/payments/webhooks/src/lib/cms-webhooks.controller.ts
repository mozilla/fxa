/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { CmsWebhookService } from './cms-webhooks.service';
import type { StrapiValidationWebhookPayload } from './cms-webhooks.types';

@Controller('webhooks')
export class CmsWebhooksController {
  constructor(private cmsWebhookService: CmsWebhookService) {}

  @Post('strapi/validation')
  @HttpCode(200)
  async postStrapiValidation(
    @Headers('authorization') authorization: string,
    @Body() body: StrapiValidationWebhookPayload
  ) {
    await this.cmsWebhookService.handleValidationWebhook(authorization, body);
    return { success: true };
  }
}
