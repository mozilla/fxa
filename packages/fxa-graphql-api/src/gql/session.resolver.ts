/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import AuthClient from 'fxa-auth-client';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { AuthClientService } from '../backend/auth-client.service';
import { GqlSessionToken, GqlUserId, GqlUserState } from '../decorators';
import { DestroySessionInput } from './dto/input';
import { BasicPayload } from './dto/payload';
import { Session as SessionType } from './model/session';

@Resolver((of: any) => SessionType)
export class SessionResolver {
  constructor(
    private log: MozLoggerService,
    @Inject(AuthClientService) private authAPI: AuthClient
  ) {}

  @Mutation((returns) => BasicPayload, {
    description: 'Logs out the current session',
  })
  @UseGuards(GqlAuthGuard)
  public async destroySession(
    @GqlSessionToken() token: string,
    @Args('input', { type: () => DestroySessionInput })
    input: DestroySessionInput
  ): Promise<BasicPayload> {
    await this.authAPI.sessionDestroy(token);
    return {
      clientMutationId: input.clientMutationId,
    };
  }

  @Query((returns) => SessionType)
  @UseGuards(GqlAuthGuard)
  session(@GqlUserId() uid: string, @GqlUserState() state: string) {
    this.log.info('session', { uid });
    return {
      verified: state === 'verified',
    } as SessionType;
  }
}
