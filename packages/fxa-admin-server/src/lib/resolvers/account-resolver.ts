/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Arg, Query, Resolver } from 'type-graphql';

import { Account as AccountType } from './types/account';

@Resolver(of => AccountType)
export class AccountResolver {
  @Query(returns => AccountType, { nullable: true })
  public accountByUid(@Arg('uid', { nullable: false }) uid: string) {
    return;
  }

  @Query(returns => AccountType, { nullable: true })
  public accountByEmail(@Arg('email', { nullable: false }) email: string) {
    return;
  }
}
