/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Arg, Mutation, Resolver } from 'type-graphql';

import { EmailBounce } from './types/email-bounces';

@Resolver(of => EmailBounce)
export class EmailBounceResolver {
  @Mutation(returns => Boolean)
  public async clearEmailBounce(@Arg('email') email: string) {
    return false;
  }
}
