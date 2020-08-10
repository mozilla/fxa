/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Arg, Ctx, FieldResolver, Query, Resolver, Root } from 'type-graphql';

import { Account, EmailBounces, Emails } from '../db/models';
import { uuidTransformer } from '../db/transformers';
import { Context } from '../server';
import { Account as AccountType } from './types/account';

const ACCOUNT_COLUMNS = ['uid', 'email', 'emailVerified', 'createdAt'];
const EMAIL_COLUMNS = [
  'createdAt',
  'email',
  'id',
  'isPrimary',
  'isVerified',
  'normalizedEmail',
  'uid',
  'verifiedAt',
];

@Resolver((of) => AccountType)
export class AccountResolver {
  @Query((returns) => AccountType, { nullable: true })
  public accountByUid(
    @Arg('uid', { nullable: false }) uid: string,
    @Ctx() context: Context
  ) {
    let uidBuffer;
    try {
      uidBuffer = uuidTransformer.to(uid);
    } catch (err) {
      return;
    }
    context.logAction('accountByUid', { uid });
    return Account.query().select(ACCOUNT_COLUMNS).findOne({ uid: uidBuffer });
  }

  @Query((returns) => AccountType, { nullable: true })
  public accountByEmail(
    @Arg('email', { nullable: false }) email: string,
    @Ctx() context: Context
  ) {
    context.logAction('accountByEmail', { email });
    return Account.query()
      .select(ACCOUNT_COLUMNS.map((c) => 'accounts.' + c))
      .innerJoin('emails', 'emails.uid', 'accounts.uid')
      .where('emails.normalizedEmail', email)
      .first();
  }

  @FieldResolver()
  public async emailBounces(@Root() account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    // MySQL Query optimizer does weird things, use separate queries to force index use
    const emails = await Emails.query()
      .select('emails.normalizedEmail')
      .where('emails.uid', uidBuffer);
    const result = await EmailBounces.query().where(
      'emailBounces.email',
      'in',
      emails.map((x) => x.normalizedEmail)
    );
    return result;
  }

  @FieldResolver()
  public async emails(@Root() account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await Emails.query().select(EMAIL_COLUMNS).where('uid', uidBuffer);
  }
}
