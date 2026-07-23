/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';

import { FreeAccessProgramWebhooksService } from './free-access-program-webhooks.service';
import type { StrapiAccessWebhookPayload } from './util/classifyAccessWebhook';

@Controller('webhooks')
export class FreeAccessProgramWebhooksController {
  constructor(private service: FreeAccessProgramWebhooksService) {}

  @Post('strapi/free-access-program/access')
  @HttpCode(200)
  async postAccess(
    @Headers('authorization') authorization: string,
    @Body() body: StrapiAccessWebhookPayload
  ) {
    return this.service.handleAccessWebhook(authorization, body);
  }
}
