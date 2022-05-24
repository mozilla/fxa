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
import { SecurityEventNames } from 'fxa-shared/db/models/auth/security-event';
import { AdminPanelFeature } from 'fxa-shared/guards';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import { CurrentUser } from '../../auth/auth-header.decorator';
import { GqlAuthHeaderGuard } from '../../auth/auth-header.guard';
import { Features } from '../../auth/user-group-header.decorator';
import { AppConfig } from '../../config';
import { DatabaseService } from '../../database/database.service';
import { uuidTransformer } from '../../database/transformers';
import { Account as AccountType } from '../../gql/model/account.model';
import { AttachedClient } from '../../gql/model/attached-clients.model';
import { Email as EmailType } from '../../gql/model/emails.model';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';

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
  'diagnosticCode',
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

  private get ipHmacKey() {
    return this.configService.get('ipHmacKey') as AppConfig['ipHmacKey'];
  }

  constructor(
    private log: MozLoggerService,
    private db: DatabaseService,
    private subscriptionsService: SubscriptionsService,
    private configService: ConfigService<AppConfig>
  ) {}

  @Features(AdminPanelFeature.AccountSearch)
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

  @Features(AdminPanelFeature.AccountSearch)
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

  @Features(AdminPanelFeature.AccountSearch)
  @Query((returns) => [EmailType], { nullable: true })
  public getEmailsLike(@Args('search', { nullable: false }) search: string) {
    return this.db.emails
      .query()
      .select(EMAIL_COLUMNS)
      .where('email', 'like', `${search}%`)
      .limit(10);
  }

  // unverifies the user's email. will have to verify again on next login
  @Features(AdminPanelFeature.UnverifyEmail)
  @Mutation((returns) => Boolean)
  public async unverifyEmail(@Args('email') email: string) {
    const result = await this.db.emails
      .query()
      .where('email', email)
      .update({
        isVerified: false,
        verifiedAt: null as any, // same as null
      });
    return !!result;
  }

  @Features(AdminPanelFeature.DisableAccount)
  @Mutation((returns) => Boolean)
  public async disableAccount(@Args('uid') uid: string) {
    const uidBuffer = uuidTransformer.to(uid);
    const result = await this.db.account
      .query()
      .update({ disabledAt: Date.now() })
      .where('uid', uidBuffer);
    return !!result;
  }

  @Features(AdminPanelFeature.EnableAccount)
  @Mutation((returns) => Boolean)
  public async enableAccount(@Args('uid') uid: string) {
    const uidBuffer = uuidTransformer.to(uid);
    const result = await this.db.account
      .query()
      .update({ disabledAt: null })
      .where('uid', uidBuffer);
    return !!result;
  }

  @Features(AdminPanelFeature.AccountSearch)
  @Mutation((returns) => Boolean)
  public async recordAdminSecurityEvent(
    @Args('uid') uid: string,
    @Args('name') name: SecurityEventNames
  ) {
    // the ipAddr and ipHmacKey values here are required, but also have no bearing on this type of record.
    // the securityEvents table is being repurposed to store a broader variety of events, hence the dummy values.
    const result = await this.db.securityEvents.create({
      uid,
      name,
      ipAddr: '',
      ipHmacKey: this.ipHmacKey,
    });
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

  @Features(AdminPanelFeature.AccountSearch)
  @ResolveField()
  public async emails(@Root() account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.emails
      .query()
      .select(EMAIL_COLUMNS)
      .where('uid', uidBuffer);
  }

  @Features(AdminPanelFeature.AccountSearch)
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

  @Features(AdminPanelFeature.AccountSearch)
  @ResolveField()
  public async totp(@Root() account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.totp
      .query()
      .select(TOTP_COLUMNS)
      .where('uid', uidBuffer);
  }

  @Features(AdminPanelFeature.AccountSearch)
  @ResolveField()
  public async recoveryKeys(@Root() account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.recoveryKeys
      .query()
      .select(RECOVERYKEY_COLUMNS)
      .where('uid', uidBuffer);
  }

  @Features(AdminPanelFeature.AccountSearch)
  @ResolveField()
  public async subscriptions(@Root() account: Account) {
    return await this.subscriptionsService.getSubscriptions(account.uid);
  }

  @ResolveField()
  public async linkedAccounts(@Root() account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.linkedAccounts
      .query()
      .select(LINKEDACCOUNT_COLUMNS)
      .where('uid', uidBuffer);
  }

  @Features(AdminPanelFeature.ConnectedServices)
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

  @Features(AdminPanelFeature.UnlinkAccount)
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
