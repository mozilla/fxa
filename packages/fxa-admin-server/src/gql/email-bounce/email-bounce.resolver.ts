/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import { CurrentUser } from '../../auth/auth-header.decorator';
import { GqlAuthHeaderGuard } from '../../auth/auth-header.guard';
import { DatabaseService } from '../../database/database.service';
import { EmailBounce as EmailBounceType } from '../../gql/model/email-bounces.model';

@UseGuards(GqlAuthHeaderGuard)
@Resolver((of: any) => EmailBounceType)
export class EmailBounceResolver {
  constructor(private log: MozLoggerService, private db: DatabaseService) {}

  @Mutation((returns) => Boolean)
  public async clearEmailBounce(
    @Args('email') email: string,
    @CurrentUser() user: string
  ) {
    const result = await this.db.emailBounces
      .query()
      .delete()
      .where('email', email);
    this.log.info('clearEmailBounce', { user, email, success: result });
    return !!result;
  }
}
