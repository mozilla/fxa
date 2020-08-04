/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GraphQLResolveInfo } from 'graphql';
import {
  Ctx,
  Info,
  Query,
  Resolver,
} from 'type-graphql';
import { Context } from '../server';
import { Session as SessionType } from './types/session'

@Resolver((of) => SessionType)
export class SessionResolver {

  @Query((returns) => SessionType)
  session(@Ctx() context: Context, @Info() info: GraphQLResolveInfo) {
    context.logger.info('session', { uid: context.session.uid });
    return {
      verified: context.session.state === 'verified'
    } as SessionType
  }
}
