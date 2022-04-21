/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Args,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import {
  ClientFormatter,
  ConnectedServicesFactory,
  SessionToken,
} from 'fxa-shared/connected-services';
import { AttachedSession } from 'fxa-shared/connected-services/models/AttachedSession';
import { Account } from 'fxa-shared/db/models/auth';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import { CurrentUser } from '../../auth/auth-header.decorator';
import { GqlAuthHeaderGuard } from '../../auth/auth-header.guard';
import { AppConfig } from '../../config';
import { DatabaseService } from '../../database/database.service';
import { uuidTransformer } from '../../database/transformers';
import { Account as AccountType } from '../../gql/model/account.model';
import { AttachedClient } from '../../gql/model/attached-clients.model';
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
const EMAIL_BOUNCE_COLUMNS = [
  'email',
  'bounceType',
  'bounceSubType',
  'createdAt',
];
const TOTP_COLUMNS = ['uid', 'epoch', 'createdAt', 'verified', 'enabled'];
const RECOVERYKEY_COLUMNS = ['uid', 'createdAt', 'verifiedAt', 'enabled'];
const LINKEDACCOUNT_COLUMNS = ['uid', 'authAt', 'providerId', 'enabled'];

@UseGuards(GqlAuthHeaderGuard)
@Resolver((of: any) => AccountType)
export class AccountResolver {
  private get clientFormatterConfig() {
    return this.configService.get(
      'clientFormatter'
    ) as AppConfig['clientFormatter'];
  }

  constructor(
    private log: MozLoggerService,
    private db: DatabaseService,
    private configService: ConfigService<AppConfig>
  ) {}

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
    const result = await this.db.emailBounces
      .query()
      .select(...EMAIL_BOUNCE_COLUMNS, 'emailTypes.emailType as templateName')
      .join('emailTypes', 'emailTypes.id', 'emailBounces.emailTypeId')
      .where(
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
  public subscriptions(@Root() account: Account) {
    // TODO: FXA-4237 / #11094, get real subscription data
    return [
      {
        created: 1583259953,
        currentPeriodEnd: 1596758906,
        currentPeriodStart: 1594080506,
        cancelAtPeriodEnd: false,
        endAt: 1596758906,
        latestInvoice:
          'https://pay.stripe.com/invoice/acct_1GCAr3BVqmGyQTMa/invst_HbGuRujVERsyXZy0zArp7SLFRhY9i6S/pdf',
        planId: 'plan_GqM9N6qyhvxaVk',
        productName: 'Cooking with Foxkeh',
        productId: 'il_1H24MIBVqmGyQTMa2hcoK0YW',
        status: 'succeeded',
        subscriptionId: 'sub_HbGu2EjvFQpuD2',
      },
    ];
  }

  @ResolveField()
  public async linkedAccounts(@Root() account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.linkedAccounts
      .query()
      .select(LINKEDACCOUNT_COLUMNS)
      .where('uid', uidBuffer);
  }

  @ResolveField(() => [AttachedClient])
  public async attachedClients(@Root() account: Account) {
    const clientFormatter = new ClientFormatter(
      this.clientFormatterConfig,
      () => this.log
    );

    const factory = new ConnectedServicesFactory({
      formatLocation: (...args) => {
        clientFormatter.formatLocation(...args);
      },
      formatTimestamps: (...args) => {
        clientFormatter.formatTimestamps(...args);
      },
      deviceList: async () => {
        return this.db.attachedDevices(account.uid);
      },
      oauthClients: async () => {
        return await this.db.authorizedClients(account.uid);
      },
      sessions: async () => {
        return (await this.db.attachedSessions(account.uid)).map(
          (x: SessionToken) => {
            const token = x;

            // Require id is defined
            if (!x.id) {
              x.id = 'Unknown';
            }

            return token as AttachedSession;
          }
        );
      },
    });

    return (await factory.build('', 'en'))
      .sort((a, b) => (b.lastAccessTime || 0) - (a.lastAccessTime || 0))
      .map((x) => {
        if (x.sessionTokenId) x.sessionTokenId = '[REDACTED]';
        if (x.refreshTokenId) x.refreshTokenId = '[REDACTED]';
        return x;
      });
  }

  @Mutation((returns) => Boolean)
  public async unlinkAccount(
    @Args('uid') uid: string,
    @CurrentUser() user: string
  ) {
    const result = await this.db.linkedAccounts
      .query()
      .delete()
      .where({
        uid: uuidTransformer.to(uid),
        providerId: 1,
      });
    return !!result;
  }
}
