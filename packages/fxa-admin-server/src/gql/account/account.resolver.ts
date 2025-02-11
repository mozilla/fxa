/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NotifierService } from '@fxa/shared/notifier';
import { Firestore } from '@google-cloud/firestore';
import { Inject, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Args,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
import { SentryTraced } from '@sentry/nestjs';
import AuthClient from 'fxa-auth-client';
import {
  ClientFormatter,
  ConnectedServicesFactory,
  SessionToken,
} from 'fxa-shared/connected-services';
import { AttachedSession } from 'fxa-shared/connected-services/models/AttachedSession';
import { Account, getAccountCustomerByUid } from 'fxa-shared/db/models/auth';
import { SecurityEventNames } from 'fxa-shared/db/models/auth/security-event';
import { AdminPanelFeature } from 'fxa-shared/guards';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { ReasonForDeletion } from '../../../../../libs/shared/cloud-tasks/src';
import { CurrentUser } from '../../auth/auth-header.decorator';
import { GqlAuthHeaderGuard } from '../../auth/auth-header.guard';
import { Features } from '../../auth/user-group-header.decorator';
import { AuthClientService } from '../../backend/auth-client.service';
import {
  CloudTasks,
  CloudTasksService,
} from '../../backend/cloud-tasks.service';
import { FirestoreService } from '../../backend/firestore.service';
import { ProfileClientService } from '../../backend/profile-client.service';
import { AppConfig } from '../../config';
import { DatabaseService } from '../../database/database.service';
import { uuidTransformer } from '../../database/transformers';
import {
  EventLoggingService,
  EventNames,
} from '../../event-logging/event-logging.service';
import { AccountEvent as AccountEventType } from '../../gql/model/account-events.model';
import { Account as AccountType } from '../../gql/model/account.model';
import { AttachedClient } from '../../gql/model/attached-clients.model';
import { Email as EmailType } from '../../gql/model/emails.model';
import { BasketService } from '../../newsletters/basket.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import {
  AccountDeleteResponse,
  AccountDeleteStatus,
  AccountDeleteTaskStatus,
} from '../model/account-delete-task.model';

const ACCOUNT_COLUMNS = [
  'uid',
  'email',
  'emailVerified',
  'createdAt',
  'disabledAt',
  'lockedAt',
  'verifierSetAt',
  'locale',
  'clientSalt',
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
const RECOVERYKEY_COLUMNS = [
  'uid',
  'createdAt',
  'verifiedAt',
  'enabled',
  'hint',
];
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
    private configService: ConfigService<AppConfig>,
    private eventLogging: EventLoggingService,
    private basketService: BasketService,
    private notifier: NotifierService,
    @Inject(AuthClientService) private authAPI: AuthClient,
    @Inject(FirestoreService) private firestore: Firestore,
    @Inject(CloudTasksService) private cloudTask: CloudTasks,
    @Inject(ProfileClientService) private profileClient: ProfileClientService
  ) {}

  @Features(AdminPanelFeature.AccountSearch)
  @Query((returns) => AccountType, { nullable: true })
  public async accountByUid(
    @Args('uid', { nullable: false }) uid: string,
    @CurrentUser() user: string
  ) {
    this.eventLogging.onAccountSearch('uid', false);
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
  @SentryTraced('accountByEmail')
  public async accountByEmail(
    @Args('email', { nullable: false }) email: string,
    @Args('autoCompleted', { nullable: false }) autoCompleted: boolean,
    @CurrentUser() user: string
  ) {
    this.eventLogging.onAccountSearch('email', autoCompleted);
    this.log.info('accountByEmail', { email, user });

    // Always prefer looks up using the known emails table
    let account = await this.db.account
      .query()
      .select(ACCOUNT_COLUMNS.map((c) => 'accounts.' + c))
      .innerJoin('emails', 'emails.uid', 'accounts.uid')
      .where('emails.normalizedEmail', email.toLocaleLowerCase())
      .first();

    // fallback to the accounts.normalized email table
    if (!account) {
      account = await this.db.account
        .query()
        .select(ACCOUNT_COLUMNS.map((c) => 'accounts.' + c))
        .where('accounts.normalizedEmail', email.toLocaleLowerCase())
        .first();
    }

    return account;
  }

  @Features(AdminPanelFeature.AccountSearch)
  @Query((returns) => [EmailType], { nullable: true })
  public getEmailsLike(@Args('search', { nullable: false }) search: string) {
    return this.db.emails
      .query()
      .select(EMAIL_COLUMNS)
      .where('normalizedEmail', 'like', `${search.toLowerCase()}%`)
      .limit(10);
  }

  // unverifies the user's email. will have to verify again on next login
  @Features(AdminPanelFeature.UnverifyEmail)
  @Mutation((returns) => Boolean)
  public async unverifyEmail(@Args('email') email: string) {
    this.eventLogging.onEvent(EventNames.UnverifyEmail);
    const result = await this.db.emails
      .query()
      .where('normalizedEmail', 'like', `${email.toLowerCase()}%`)
      .update({
        isVerified: false,
        verifiedAt: null as any, // same as null
      });
    return !!result;
  }

  @Features(AdminPanelFeature.DisableAccount)
  @Mutation((returns) => Boolean)
  public async disableAccount(@Args('uid') uid: string) {
    this.eventLogging.onEvent(EventNames.DisableLogin);
    await this.profileClient.deleteCache(uid);
    await this.notifier.send({
      event: 'profileDataChange',
      data: {
        ts: Date.now() / 1000,
        uid,
      },
    });
    const uidBuffer = uuidTransformer.to(uid);
    const result = await this.db.account
      .query()
      .update({ disabledAt: Date.now() })
      .where('uid', uidBuffer);
    return !!result;
  }

  @Features(AdminPanelFeature.EditLocale)
  @Mutation((returns) => Boolean)
  public async editLocale(
    @Args('uid') uid: string,
    @Args('locale') locale: string
  ) {
    this.eventLogging.onEvent(EventNames.EditLocale);
    const uidBuffer = uuidTransformer.to(uid);
    const result = await this.db.account
      .query()
      .update({ locale: locale })
      .where('uid', uidBuffer);

    await this.profileClient.deleteCache(uid);
    await this.notifier.send({
      event: 'profileDataChange',
      data: {
        ts: Date.now() / 1000,
        uid,
      },
    });

    return !!result;
  }

  @Features(AdminPanelFeature.EnableAccount)
  @Mutation((returns) => Boolean)
  public async enableAccount(@Args('uid') uid: string) {
    const uidBuffer = uuidTransformer.to(uid);
    const result = await this.db.account
      .query()
      .update({ disabledAt: null } as any)
      .where('uid', uidBuffer);

    await this.profileClient.deleteCache(uid);
    await this.notifier.send({
      event: 'profileDataChange',
      data: {
        ts: Date.now() / 1000,
        uid,
      },
    });

    return !!result;
  }

  @Features(AdminPanelFeature.SendPasswordResetEmail)
  @Mutation((returns) => Boolean)
  public async sendPasswordResetEmail(@Args('email') email: string) {
    const result = await this.authAPI.passwordForgotSendCode(email);
    return !!result;
  }

  @Features(AdminPanelFeature.AccountSearch)
  @Mutation((returns) => Boolean)
  public async recordAdminSecurityEvent(
    @Args('uid') uid: string,
    @Args('name', { type: () => String }) name: SecurityEventNames
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
  public async accountEvents(@Root() account: Account) {
    // Not sure the best way for admin panel to get this config from event broker config
    const eventsDbRef = this.firestore.collection('fxa-eb-users');
    const queryResult = await eventsDbRef
      .doc(account.uid)
      .collection('events')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    return queryResult.docs.map((doc) => doc.data() as AccountEventType);
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

  @Features(AdminPanelFeature.UnsubscribeFromMailingLists)
  @Mutation((returns) => Boolean)
  public async unsubscribeFromMailingLists(@Args('uid') uid: string) {
    // Look up email. This end point is protected, but using a uid would makes it harder
    // to abuse regardless.
    const account = await this.db.account
      .query()
      .select('email')
      .where({ uid: uuidTransformer.to(uid) })
      .first();

    if (!account) {
      return false;
    }

    // Look up user token
    const token = await this.basketService.getUserToken(account.email);
    if (!token) {
      return false;
    }

    // Request that user is unsubscribed from mailing list
    const success = await this.basketService.unsubscribeAll(token);

    // Record an event if action was successful
    if (success) {
      this.eventLogging.onEvent(EventNames.UnsubscribeFromMailingLists);
    }

    return success;
  }

  @Features(AdminPanelFeature.DeleteAccount)
  @Query((returns) => [AccountDeleteTaskStatus])
  public async getDeleteStatus(
    @Args('taskNames', { type: () => [String] }) taskNames: string[]
  ) {
    const results = [];
    for (const taskName of taskNames) {
      try {
        const [result] = await this.cloudTask.accountTasks.getTaskStatus(
          taskName
        );
        if (result == null) {
          results.push({
            taskName,
            status: 'Unknown task',
          });
        } else {
          results.push({
            taskName,
            status: result.lastAttempt?.responseStatus?.message || 'Pending',
          });
        }
      } catch (error) {
        if (error.code === 9) {
          results.push({
            taskName,
            status: 'Task completed.',
          });
        } else {
          results.push({
            taskName,
            status: 'Could not locate task.',
          });
        }
      }
    }
    return results;
  }

  @Features(AdminPanelFeature.DeleteAccount)
  @Mutation((returns) => [AccountDeleteResponse])
  public async deleteAccounts(
    @Args('locators', { type: () => [String] }) locators: string[],
    @CurrentUser() user: string
  ) {
    this.eventLogging.onEvent('deleteAccounts');

    if (locators.length > 1000) {
      throw new Error('Provide less than 1000 account locators.');
    }

    /** Helper function to query account and create cloud task */
    const createTask = async (
      locator: string
    ): Promise<AccountDeleteResponse> => {
      // Important! Log this action for historical record
      this.log.info('deleteAccounts', { locator, user });

      let account: Account | undefined;
      if (/@/.test(locator)) {
        account = await this.db.account
          .query()
          .select(ACCOUNT_COLUMNS.map((c) => 'accounts.' + c))
          .innerJoin('emails', 'emails.uid', 'accounts.uid')
          .where('emails.normalizedEmail', locator.toLocaleLowerCase())
          .first();
      } else if (/.*/.test(locator)) {
        let uidBuffer;
        try {
          uidBuffer = uuidTransformer.to(locator);
        } catch (err) {
          return {
            taskName: '',
            locator,
            status: AccountDeleteStatus.NoAccount,
          };
        }
        account = await this.db.account
          .query()
          .select(ACCOUNT_COLUMNS)
          .findOne({ uid: uidBuffer });
      }

      if (!account) {
        return {
          taskName: '',
          locator,
          status: AccountDeleteStatus.NoAccount,
        };
      }
      // Locate stripe customer
      const { stripeCustomerId } =
        (await getAccountCustomerByUid(account.uid)) || {};

      const taskName = await this.cloudTask.accountTasks.deleteAccount({
        uid: account.uid,
        customerId: stripeCustomerId,
        reason: ReasonForDeletion.UserRequested,
      });

      if (taskName) {
        return {
          taskName,
          locator,
          status: AccountDeleteStatus.Success,
        };
      }

      return {
        taskName: '',
        locator,
        status: AccountDeleteStatus.Failure,
      };
    };

    const promises = [];
    for (const locator of locators) {
      promises.push(createTask(locator));
    }

    const result = await Promise.all(promises);
    return result;
  }
}
