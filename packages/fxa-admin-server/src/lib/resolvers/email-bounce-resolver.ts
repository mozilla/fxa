/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { EmailBounces } from '../db/models';
import { Context } from '../server';
import { EmailBounce } from './types/email-bounces';

@Resolver(of => EmailBounce)
export class EmailBounceResolver {
  @Mutation(returns => Boolean)
  public async clearEmailBounce(@Arg('email') email: string, @Ctx() context: Context) {
    const result = await EmailBounces.query()
      .delete()
      .where('email', email);
    context.logAction('clearEmailBounce', { email, success: result });
    return !!result;
  }
}
