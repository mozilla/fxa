/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  ValidateResponse,
  zodToOpenApi,
} from '@fxa/payments/api-server/server-utils';
import { MeteringExceptionFilter } from './metering-exception.filter';
import {
  CurrentMeteringClient,
  MeteringAuthGuard,
  type AuthenticatedMeteringClient,
} from './metering-auth.guard';
import {
  ingestUsageRequestSchema,
  usageQueryParamsSchema,
  usageQueryResponseSchema,
  type UsageQueryResponse,
} from './metering.schema';
import { UsageService } from './usage.service';

@ApiTags('Metering')
@ApiBearerAuth()
@Controller('v1/metering/usage')
@UseGuards(MeteringAuthGuard)
@UseFilters(MeteringExceptionFilter)
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Post()
  @HttpCode(202)
  @ApiOperation({
    summary: 'Ingest a usage event',
    description:
      'Records a usage event for a metered product. Events are deduplicated by the id field — ' +
      'retries with the same id will not double-count within the retention window. ' +
      'Requires a valid metering service credential.',
  })
  @ApiBody({ schema: zodToOpenApi(ingestUsageRequestSchema) })
  @ApiResponse({
    status: 202,
    description: 'Usage event accepted for processing',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body — one or more fields failed validation',
  })
  async ingest(
    @Body() body: unknown,
    @CurrentMeteringClient()
    authenticatedMeteringClient: AuthenticatedMeteringClient
  ): Promise<void> {
    const parsed = ingestUsageRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues.map(({ code, path }) => ({ code, path }))
      );
    }
    await this.usageService.ingestUsage(parsed.data);
  }

  @Get(':userIdentifier/:slug')
  @ApiOperation({
    summary: 'Query usage data for a user and meter',
    description:
      'Returns the current usage, limit, and metering window for a specific user and meter slug. ' +
      'Requires a valid metering service credential.',
  })
  @ApiParam({
    name: 'userIdentifier',
    description: 'Unique identifier for the user being queried',
  })
  @ApiParam({
    name: 'slug',
    description: 'Meter slug identifier to query usage for',
  })
  @ApiResponse({
    status: 200,
    description: 'Current usage data for the requested meter and user',
    schema: zodToOpenApi(usageQueryResponseSchema),
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid parameters — userIdentifier or slug failed validation',
  })
  @ValidateResponse(usageQueryResponseSchema)
  async query(
    @Param('userIdentifier') userIdentifier: string,
    @Param('slug') slug: string,
    @CurrentMeteringClient()
    authenticatedMeteringClient: AuthenticatedMeteringClient
  ): Promise<UsageQueryResponse> {
    const parsed = usageQueryParamsSchema.safeParse({ userIdentifier, slug });
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues.map(({ code, path }) => ({ code, path }))
      );
    }
    return this.usageService.queryUsage(parsed.data);
  }
}
