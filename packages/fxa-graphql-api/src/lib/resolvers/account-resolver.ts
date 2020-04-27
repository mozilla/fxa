/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Ctx, Query, Resolver } from 'type-graphql';

import { Account } from '../db/models';
import { uuidTransformer } from '../db/transformers';
import { Context } from '../server';
import { Account as AccountType } from './types/account';

@Resolver((of) => AccountType)
export class AccountResolver {
  @Query((returns) => AccountType, { nullable: true })
  public account(@Ctx() context: Context) {
    let uidBuffer;
    try {
      uidBuffer = uuidTransformer.to(context.authUser);
    } catch (err) {
      return;
    }
    context.logAction('accountByUid', { uid: context.authUser });
    return Account.query().findOne({ uid: uidBuffer });
  }
}
