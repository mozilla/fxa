/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import { CurrentUser } from '../../auth/auth-header.decorator';
import { GqlAuthHeaderGuard } from '../../auth/auth-header.guard';
import { DatabaseService } from '../../database/database.service';
import { Account } from '../../database/model';
import { uuidTransformer } from '../../database/transformers';
import { Account as AccountType } from '../../gql/model/account.model';
import { Email as EmailType } from '../../gql/model/emails.model';

const ACCOUNT_COLUMNS = [
  'uid',
  'email',
  'emailVerified',
  'createdAt',
  'disabledAt',
];
const EMAIL_COLUMNS = [
  'createdAt',
  'email',
  'id',
  'isPrimary',
  'isVerified',
  'normalizedEmail',
  'uid',
];

const SECURITY_EVENTS_COLUMNS = ['uid', 'verified', 'createdAt'];
const TOTP_COLUMNS = ['uid', 'epoch', 'createdAt', 'verified', 'enabled'];
const RECOVERYKEY_COLUMNS = ['uid', 'createdAt', 'verifiedAt', 'enabled'];
const SESSIONTOKEN_COLUMNS = [
  'tokenId',
  'uid',
  'createdAt',
  'uaBrowser',
  'uaBrowserVersion',
  'uaOS',
  'uaOSVersion',
  'uaDeviceType',
  'lastAccessTime',
  'uaFormFactor',
  'authAt',
  'verificationMethod',
  'verifiedAt',
  'mustVerify',
];

@UseGuards(GqlAuthHeaderGuard)
@Resolver((of: any) => AccountType)
export class AccountResolver {
  constructor(private log: MozLoggerService, private db: DatabaseService) {}

  @Query((returns) => AccountType, { nullable: true })
  public accountByUid(
    @Args('uid', { nullable: false }) uid: string,
    @CurrentUser() user: string
  ) {
    let uidBuffer;
    try {
      uidBuffer = uuidTransformer.to(uid);
    } catch (err) {
      return;
    }
    this.log.info('accountByUid', { uid, user });
    return this.db.account
      .query()
      .select(ACCOUNT_COLUMNS)
      .findOne({ uid: uidBuffer });
  }

  @Query((returns) => AccountType, { nullable: true })
  public accountByEmail(
    @Args('email', { nullable: false }) email: string,
    @CurrentUser() user: string
  ) {
    this.log.info('accountByEmail', { email, user });
    return this.db.account
      .query()
      .select(ACCOUNT_COLUMNS.map((c) => 'accounts.' + c))
      .innerJoin('emails', 'emails.uid', 'accounts.uid')
      .where('emails.normalizedEmail', email)
      .first();
  }

  @Query((returns) => [EmailType], { nullable: true })
  public getEmailsLike(@Args('search', { nullable: false }) search: string) {
    return this.db.emails
      .query()
      .select(EMAIL_COLUMNS)
      .where('email', 'like', `${search}%`)
      .limit(10);
  }

  // unverifies the user's email. will have to verify again on next login
  @Mutation((returns) => Boolean)
  public async unverifyEmail(
    @Args('email') email: string,
    @CurrentUser() user: string
  ) {
    const result = await this.db.emails
      .query()
      .where('email', email)
      .update({
        isVerified: false,
        verifiedAt: null as any, // same as null
      });
    return !!result;
  }

  @Mutation((returns) => Boolean)
  public async disableAccount(
    @Args('uid') uid: string,
    @CurrentUser() user: string
  ) {
    const uidBuffer = uuidTransformer.to(uid);
    const result = await this.db.account
      .query()
      .update({ disabledAt: Date.now() })
      .where('uid', uidBuffer);
    return !!result;
  }

  @ResolveField()
  public async emailBounces(@Root() account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    // MySQL Query optimizer does weird things, use separate queries to force index use
    const emails = await this.db.emails
      .query()
      .select('emails.normalizedEmail')
      .where('emails.uid', uidBuffer);
    const result = await this.db.emailBounces.query().where(
      'emailBounces.email',
      'in',
      emails.map((x) => x.normalizedEmail)
    );
    return result;
  }

  @ResolveField()
  public async emails(@Root() account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.emails
      .query()
      .select(EMAIL_COLUMNS)
      .where('uid', uidBuffer);
  }

  @ResolveField()
  public async securityEvents(@Root() account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.securityEvents
      .query()
      .select(...SECURITY_EVENTS_COLUMNS, 'securityEventNames.name as name')
      .join(
        'securityEventNames',
        'securityEvents.nameId',
        'securityEventNames.id'
      )
      .where('uid', uidBuffer)
      .limit(10)
      .orderBy('createdAt', 'DESC');
  }

  @ResolveField()
  public async totp(@Root() account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.totp
      .query()
      .select(TOTP_COLUMNS)
      .where('uid', uidBuffer);
  }

  @ResolveField()
  public async recoveryKeys(@Root() account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.recoveryKeys
      .query()
      .select(RECOVERYKEY_COLUMNS)
      .where('uid', uidBuffer);
  }

  @ResolveField()
  public async sessionTokens(@Root() account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.sessionTokens
      .query()
      .select(SESSIONTOKEN_COLUMNS)
      .where('uid', uidBuffer);
  }
}
