/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminPanelFeature } from '@fxa/shared/guards';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { AuditLog } from '../../auth/audit-log.decorator';

import { RateLimit, RateLimitClient } from '@fxa/accounts/rate-limit';
import { CurrentUser } from '../../auth/auth-header.decorator';
import { AuthHeaderGuard } from '../../auth/auth-header.guard';
import { Features } from '../../auth/user-group-header.decorator';
import { BlockStatus } from '../../types';

@UseGuards(AuthHeaderGuard)
@Controller('/api/rate-limits')
export class RateLimitingController {
  constructor(
    private log: MozLoggerService,
    @Inject(RateLimitClient) private rateLimit: RateLimit
  ) {}

  @Get()
  @Features(AdminPanelFeature.RateLimiting)
  public async rateLimits(
    @CurrentUser() user: string,
    @Query('ip') ip?: string,
    @Query('email') email?: string,
    @Query('uid') uid?: string
  ): Promise<BlockStatus[]> {
    this.log.info('rateLimits', { user, query: { ip, email, uid } });
    return await this.rateLimit.search({ ip, email, uid });
  }

  @Post('clear')
  @Features(AdminPanelFeature.RateLimiting)
  @AuditLog()
  public async clearRateLimits(
    @CurrentUser() user: string,
    @Body('ip') ip?: string,
    @Body('email') email?: string,
    @Body('uid') uid?: string
  ): Promise<number> {
    this.log.info('clear', { user, ip, email, uid });

    return await this.rateLimit.searchAndClear({ ip, email, uid });
  }
}
