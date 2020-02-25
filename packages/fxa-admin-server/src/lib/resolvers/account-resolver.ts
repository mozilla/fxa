/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Arg, FieldResolver, Query, Resolver, Root } from 'type-graphql';

import { Account, EmailBounces } from '../db/models';
import { uuidTransformer } from '../db/transformers';
import { Account as AccountType } from './types/account';

@Resolver(of => AccountType)
export class AccountResolver {
  @Query(returns => AccountType, { nullable: true })
  public accountByUid(@Arg('uid', { nullable: false }) uid: string) {
    let uidBuffer;
    try {
      uidBuffer = uuidTransformer.to(uid);
    } catch (err) {
      return;
    }
    return Account.query().findOne({ uid: uidBuffer });
  }

  @Query(returns => AccountType, { nullable: true })
  public accountByEmail(@Arg('email', { nullable: false }) email: string) {
    return Account.query()
      .innerJoin('emails', 'emails.uid', 'accounts.uid')
      .where('emails.normalizedEmail', email)
      .first();
  }

  @FieldResolver()
  public async emailBounces(@Root() account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    const result = await EmailBounces.query()
      .innerJoin('emails', 'emailBounces.email', 'emails.normalizedEmail')
      .where('emails.uid', uidBuffer);
    return result;
  }
}
