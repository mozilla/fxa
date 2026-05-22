/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';

import { MeteringCloudTaskGuard } from './metering-cloudtask.guard';
import { MeteringThresholdService } from './metering-threshold.service';
import { thresholdCheckTaskBodySchema } from './metering.schema';

@Controller('v1/metering/internal')
@UseGuards(MeteringCloudTaskGuard)
export class MeteringCloudTasksController {
  constructor(
    private readonly meteringThresholdService: MeteringThresholdService
  ) {}

  @Post('threshold-check')
  @HttpCode(200)
  async thresholdCheck(@Body() body: unknown): Promise<{ outcome: string }> {
    const parsed = thresholdCheckTaskBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    const outcome = await this.meteringThresholdService.handleThresholdCheck(parsed.data);
    return { outcome };
  }
}
