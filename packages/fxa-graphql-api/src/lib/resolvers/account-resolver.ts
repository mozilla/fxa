/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Ctx, Query, Resolver, FieldResolver, Root, Info } from 'type-graphql';
import {
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';
import { GraphQLResolveInfo } from 'graphql';

import { accountByUid, Account, AccountOptions } from '../db/models/auth';
import { profileByUid, selectedAvatar } from '../db/models/profile';
import { Context } from '../server';
import { Account as AccountType } from './types/account';

@Resolver((of) => AccountType)
export class AccountResolver {
  @Query((returns) => AccountType, { nullable: true })
  public account(@Ctx() context: Context, @Info() info: GraphQLResolveInfo) {
    context.logAction('account', { uid: context.authUser });

    // Introspect the query to determine if we should load the emails
    const parsed: any = parseResolveInfo(info);
    const simplified = simplifyParsedResolveInfoFragmentWithType(parsed, info.returnType);
    const includeEmails = simplified.fields.hasOwnProperty('emails');

    const options: AccountOptions = {};
    if (includeEmails) {
      options.include = ['emails'];
    }
    return accountByUid(context.authUser, options);
  }

  @FieldResolver()
  public accountCreated(@Root() account: Account) {
    return account.createdAt;
  }

  @FieldResolver()
  public passwordCreated(@Root() account: Account) {
    return account.verifierSetAt;
  }

  @FieldResolver()
  public async displayName(@Root() account: Account) {
    const profile = await profileByUid(account.uid);
    return profile ? profile.displayName : null;
  }

  @FieldResolver()
  public async avatarUrl(@Root() account: Account) {
    const avatar = await selectedAvatar(account.uid);
    return avatar ? avatar.url : null;
  }

  @FieldResolver()
  public emails(@Root() account: Account) {
    if (account.emails) {
      return account.emails.map((e) => {
        return { email: e.email, isPrimary: e.isPrimary, verified: e.isVerified };
      });
    } else {
      return null;
    }
  }
}
