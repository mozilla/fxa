/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { zodToOpenApi } from '@fxa/payments/api-server/server-utils';

import { MeteringCloudTasksGuard } from './metering-cloud-tasks.guard';
import { MeteringExceptionFilter } from './metering-exception.filter';
import { MeteringSweepService } from './metering-sweep.service';
import { sweepRequestSchema } from './metering.schema';
import type { SweepResult } from './metering.types';
import { parseRequest } from './utils/parseRequest';

@ApiTags('Metering Internal')
@Controller('v1/metering/internal')
@UseGuards(MeteringCloudTasksGuard)
@UseFilters(MeteringExceptionFilter)
export class MeteringSweepController {
  constructor(private readonly meteringSweepService: MeteringSweepService) {}

  @Post('sweep')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Run a threshold sweep for one meter',
    description:
      'Internal endpoint invoked on a schedule. Finds every subject of the given meter ' +
      'that has crossed a notification threshold since the last sweep and dispatches ' +
      'their webhooks. Authenticated by Google OIDC identity token.',
  })
  @ApiBody({ schema: zodToOpenApi(sweepRequestSchema) })
  @ApiResponse({ status: 200, description: 'Sweep completed' })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body — clientId or slug failed validation',
  })
  async sweep(@Body() body: unknown): Promise<SweepResult> {
    return this.meteringSweepService.sweep(
      parseRequest(sweepRequestSchema, body)
    );
  }
}
