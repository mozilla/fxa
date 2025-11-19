/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UseGuards, Inject } from '@nestjs/common';
import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { AdminPanelFeature } from '@fxa/shared/guards';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { AuditLog } from '../../auth/audit-log.decorator';

import { RateLimit, RateLimitClient } from '@fxa/accounts/rate-limit';
import { CurrentUser } from '../../auth/auth-header.decorator';
import { GqlAuthHeaderGuard } from '../../auth/auth-header.guard';
import { Features } from '../../auth/user-group-header.decorator';
import { BlockStatus } from '../model/block-status.model';

@UseGuards(GqlAuthHeaderGuard)
@Resolver(() => BlockStatus)
export class RateLimitingResolver {
  constructor(
    private log: MozLoggerService,
    @Inject(RateLimitClient) private rateLimit: RateLimit
  ) {}

  @Query(() => [BlockStatus])
  @Features(AdminPanelFeature.RateLimiting)
  public async rateLimits(
    @CurrentUser() user: string,
    @Args('ip', { nullable: true }) ip?: string,
    @Args('email', { nullable: true }) email?: string,
    @Args('uid', { nullable: true }) uid?: string
  ): Promise<BlockStatus[]> {
    this.log.info('rateLimits', { user, query: { ip, email, uid } });
    return await this.rateLimit.search({ ip, email, uid });
  }

  @Mutation(() => Number)
  @Features(AdminPanelFeature.RateLimiting)
  @AuditLog()
  public async clearRateLimits(
    @CurrentUser() user: string,
    @Args('ip', { type: () => String, nullable: true }) ip?: string,
    @Args('email', { type: () => String, nullable: true }) email?: string,
    @Args('uid', { type: () => String, nullable: true }) uid?: string
  ): Promise<number> {
    this.log.info('clear', { user, ip, email, uid });

    return await this.rateLimit.searchAndClear({ ip, email, uid });
  }
}
