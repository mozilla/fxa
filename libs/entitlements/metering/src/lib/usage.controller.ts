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

import { MeteringExceptionFilter } from './metering-exception.filter';
import {
  CurrentMeteringClient,
  MeteringAuthGuard,
  type AuthenticatedMeteringClient,
} from './metering-auth.guard';
import {
  ingestUsageRequestSchema,
  usageQueryParamsSchema,
  type UsageQueryResponse,
} from './metering.schema';
import { UsageService } from './usage.service';

@Controller('v1/metering/usage')
@UseGuards(MeteringAuthGuard)
@UseFilters(MeteringExceptionFilter)
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Post()
  @HttpCode(202)
  async ingest(
    @Body() body: unknown,
    @CurrentMeteringClient()
    authenticatedMeteringClient: AuthenticatedMeteringClient
  ): Promise<void> {
    const parsed = ingestUsageRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    await this.usageService.ingestUsage(parsed.data);
  }

  @Get(':userIdentifier/:slug')
  async query(
    @Param('userIdentifier') userIdentifier: string,
    @Param('slug') slug: string,
    @CurrentMeteringClient()
    authenticatedMeteringClient: AuthenticatedMeteringClient
  ): Promise<UsageQueryResponse> {
    const parsed = usageQueryParamsSchema.safeParse({ userIdentifier, slug });
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }
    return this.usageService.queryUsage(parsed.data);
  }
}
