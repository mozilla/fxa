/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
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
import { UsageGrantsService } from './usage-grants.service';
import {
  createUsageGrantRequestSchema,
  deleteUsageGrantParamsSchema,
  listUsageGrantsParamsSchema,
  listUsageGrantsResponseSchema,
  usageGrantSchema,
  type ListUsageGrantsResponse,
  type UsageGrant,
} from './usage-grants.schema';

@ApiTags('Metering')
@ApiBearerAuth()
@Controller('v1/metering/usage-grants')
@UseGuards(MeteringAuthGuard)
@UseFilters(MeteringExceptionFilter)
export class UsageGrantsController {
  constructor(private readonly usageGrantsService: UsageGrantsService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Grant additional usage to a user',
    description:
      'Grants additional usage against a meter for a user, raising the effective limit ' +
      'reported by usage queries. Requires a valid metering service credential.',
  })
  @ApiBody({ schema: zodToOpenApi(createUsageGrantRequestSchema) })
  @ApiResponse({
    status: 201,
    description: 'The created usage grant',
    schema: zodToOpenApi(usageGrantSchema),
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body — one or more fields failed validation',
  })
  @ApiResponse({
    status: 404,
    description: 'The meter slug is not configured',
  })
  @ValidateResponse(usageGrantSchema)
  async create(
    @Body() body: unknown,
    @CurrentMeteringClient()
    authenticatedMeteringClient: AuthenticatedMeteringClient
  ): Promise<UsageGrant> {
    const parsed = createUsageGrantRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues.map(({ code, path }) => ({ code, path }))
      );
    }
    return this.usageGrantsService.createGrant({
      request: parsed.data,
      grantedBy: authenticatedMeteringClient.clientId,
    });
  }

  @Get(':userIdentifier')
  @ApiOperation({
    summary: 'List a user’s usage grants',
    description:
      'Returns all usage grants for a user, optionally filtered by meter slug. ' +
      'Each grant includes an active flag reflecting whether it currently applies. ' +
      'Requires a valid metering service credential. Metering clients are mutually ' +
      'trusted: any authenticated client may read grants created by any other client.',
  })
  @ApiParam({
    name: 'userIdentifier',
    description: 'Unique identifier for the user whose grants are listed',
  })
  @ApiQuery({
    name: 'slug',
    required: false,
    description: 'Optional meter slug to filter the grants by',
  })
  @ApiResponse({
    status: 200,
    description: 'The user’s usage grants',
    schema: zodToOpenApi(listUsageGrantsResponseSchema),
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid parameters — userIdentifier or slug failed validation',
  })
  @ValidateResponse(listUsageGrantsResponseSchema)
  async list(
    @Param('userIdentifier') userIdentifier: string,
    @Query('slug') slug: string | undefined,
    @CurrentMeteringClient()
    authenticatedMeteringClient: AuthenticatedMeteringClient
  ): Promise<ListUsageGrantsResponse> {
    const parsed = listUsageGrantsParamsSchema.safeParse({
      userIdentifier,
      slug,
    });
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues.map(({ code, path }) => ({ code, path }))
      );
    }
    const grants = await this.usageGrantsService.listGrants(
      parsed.data.userIdentifier,
      parsed.data.slug
    );
    return { grants };
  }

  @Delete(':grantId')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a usage grant',
    description:
      'Deletes a single usage grant by its identifier. ' +
      'Requires a valid metering service credential. Metering clients are mutually ' +
      'trusted: any authenticated client may delete a grant created by any other client.',
  })
  @ApiParam({
    name: 'grantId',
    description: 'Identifier of the grant to delete',
  })
  @ApiResponse({ status: 204, description: 'The grant was deleted' })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters — grantId failed validation',
  })
  @ApiResponse({ status: 404, description: 'No grant exists with that id' })
  async delete(
    @Param('grantId') grantId: string,
    @CurrentMeteringClient()
    authenticatedMeteringClient: AuthenticatedMeteringClient
  ): Promise<void> {
    const parsed = deleteUsageGrantParamsSchema.safeParse({ grantId });
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues.map(({ code, path }) => ({ code, path }))
      );
    }
    await this.usageGrantsService.deleteGrant(parsed.data.grantId);
  }
}
