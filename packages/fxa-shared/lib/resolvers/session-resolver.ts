/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GraphQLResolveInfo } from 'graphql';
import { Ctx, Info, Query, Resolver, Mutation, Arg } from 'type-graphql';
import { Context } from '../server';
import { Session as SessionType } from './types/session';
import { BasicPayload } from './types/payload';
import { CatchGatewayError } from '../error';
import { DestroySessionInput } from './types/input';

@Resolver((of) => SessionType)
export class SessionResolver {
  @Mutation((returns) => BasicPayload, {
    description: 'Logs out the current session',
  })
  @CatchGatewayError
  public async destroySession(
    @Ctx() context: Context,
    @Arg('input', (type) => DestroySessionInput)
    input: DestroySessionInput
  ): Promise<BasicPayload> {
    await context.dataSources.authAPI.sessionDestroy();
    return {
      clientMutationId: input.clientMutationId,
    };
  }

  @Query((returns) => SessionType)
  session(@Ctx() context: Context, @Info() info: GraphQLResolveInfo) {
    context.logger.info('session', { uid: context.session.uid });
    return {
      verified: context.session.state === 'verified',
    } as SessionType;
  }
}
