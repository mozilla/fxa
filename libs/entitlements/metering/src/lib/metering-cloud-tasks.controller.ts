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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { zodToOpenApi } from '@fxa/payments/api-server/server-utils';
import { MeteringCloudTasksGuard } from './metering-cloud-tasks.guard';
import { MeteringThresholdService } from './metering-threshold.service';
import { thresholdCheckTaskBodySchema } from './metering.schema';

@ApiTags('Metering Internal')
@Controller('v1/metering/internal')
@UseGuards(MeteringCloudTasksGuard)
export class MeteringCloudTasksController {
  constructor(
    private readonly meteringThresholdService: MeteringThresholdService
  ) {}

  @Post('threshold-check')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Trigger a threshold check for a meter',
    description:
      'Internal endpoint invoked by Cloud Tasks to check whether a user has crossed ' +
      'a metering threshold for a given meter. Protected by the Cloud Tasks auth guard.',
  })
  @ApiBody({ schema: zodToOpenApi(thresholdCheckTaskBodySchema) })
  @ApiResponse({
    status: 200,
    description: 'Threshold check completed successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request body — slug or userIdentifier failed validation',
  })
  async thresholdCheck(@Body() body: unknown): Promise<void> {
    const parsed = thresholdCheckTaskBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues.map(({ code, path }) => ({ code, path }))
      );
    }
    await this.meteringThresholdService.handleThresholdCheck(parsed.data);
  }
}
